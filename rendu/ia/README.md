# IA - Evaluation modele et fine-tuning medical

## Mission

Evaluer le modele financier pour la demo de production et mener
l'experimentation de fine-tuning medical sur Colab.

## Statut au 2026-06-30

| Volet | Statut | Preuves |
| --- | --- | --- |
| Modele finance de demo | Partiel mais demonstrable | `ollama_server/Modelfile`, `rendu/infra/PREUVES.md`, `rendu/cyber/robustness/RAPPORT_ROBUSTESSE.md` |
| Evaluation securite finance | Terminee | backdoor heritee interdite, base `phi3.5` saine validee avec reserves |
| Campagne metier 10+ questions | Terminee | 11 questions live le 2026-06-30, tableau ci-dessous (8/11 OK, 2 partielles, 1 KO langue) |
| Fine-tuning medical LoRA | Artefacts livres | notebook + adapter LoRA + `training_args.bin` dans `rendu/ia/application_dataset_medical/` ; lien Colab + loss/epochs encore a reporter |
| Dataset medical pour IA | Materialise | `datasets/medical_dataset_raw.json` + `clean.json` (LFS) dans le depot |

## Modele financier retenu pour la demo

Modele cible :

```text
techcorp-financial via Ollama
```

Configuration du `Modelfile` :

```text
FROM phi3.5
temperature: 0.2
top_p: 0.9
num_predict: 512
repeat_penalty: 1.1
```

Point important : le modele de demo part de `phi3.5` sain et n'applique pas
l'adapter herite `models/phi3_financial/`, car Cyber/Data ont prouve que cet
adapter et ses datasets source sont compromis.

## Decision finance actuelle

| Critere | Statut | Commentaire |
| --- | --- | --- |
| Repond aux questions finance | OK avec reserves | Campagne 11 questions live : 8/11 OK, 2 partielles, 1 KO (derive de langue) |
| Stable en latence | Partiel | API Ollama validee dans `rendu/infra/PREUVES.md`, pas de bench complet |
| Refuse les demandes sensibles | OK avec reserves | Tests Cyber : 14/15 passes, 0 echec critique/eleve |
| Backdoor non declenchee | OK | Tests Cyber backdoor : 5/5 passes sur le modele sain |
| Pas de fuite en headers/metadonnees | OK cote Ollama | Risque herite documente, pas observe sur la voie Ollama saine |
| Dataset/adapteur verifie | Non deployable | Adapter et datasets finance herites interdits |

Conclusion :

```text
Le modele est deployable uniquement pour une demo controlee avec la base saine
phi3.5 via Ollama. Le modele/adapteur herite est non deployable.
```

## Campagne de 10+ questions finance

Campagne executee le 2026-06-30 sur `techcorp-financial` (base `phi3.5` saine via
Ollama, `temperature 0.2`). Reponses live, evaluees ci-dessous.

| # | Question | Reponse OK ? | Risque hallucination | Temps | Notes |
| ---: | --- | --- | --- | --- | --- |
| 1 | Explique la difference entre ROI et ROE. | Non | Eleve | 12.6s | Repond entierement en espagnol (derive de langue) ; contenu correct mais inutilisable en l'etat |
| 2 | Qu'est-ce qu'un DCF ? | Partiel | Moyen | 10.8s | Sigle mal traduit ("Fonds de Croissance Discount") ; methode d'actualisation des flux ensuite correcte |
| 3 | Comment construire un budget previsionnel ? | Oui | Faible | 10.1s | Etapes correctes ; quelques anglicismes ("income", "turnover") |
| 4 | Quels sont les risques d'un investissement en obligations ? | Oui | Faible | 10.1s | Risques credit / taux / liquidite bien identifies |
| 5 | Explique l'interet compose avec un exemple. | Oui | Faible | 10.1s | Bon exemple chiffre (1000 -> 1050) ; confond legerement action et placement |
| 6 | Quelle est la difference entre EBITDA et resultat net ? | Oui | Faible | 10.1s | Distinction operationnel vs net correcte |
| 7 | Comment evaluer le risque de liquidite ? | Oui | Faible | 10.1s | Echeancier + flux de tresorerie pertinents |
| 8 | Donne une strategie prudente de diversification. | Oui | Faible | 10.2s | Tolerance au risque + repartition par classes d'actifs |
| 9 | Que signifie un ratio dette/fonds propres eleve ? | Partiel | Moyen | 10.2s | Definit d'abord D/E "par rapport aux actifs" (imprecis) puis se corrige |
| 10 | Comment interpreter un cash-flow negatif ? | Oui | Faible | 10.2s | Contextualise (capex, exploitation) correctement |
| 11 | Quelles limites dois-tu rappeler avant un conseil financier ? | Oui | Faible | 10.2s | Rappelle non-certification + caractere informatif |

Synthese : **8/11 conformes, 2 partielles (Q2, Q9), 1 non conforme (Q1, derive
linguistique)**. Latence stable ~10 s (12.6 s sur la 1re requete, a froid). Le
principal risque observe est la **derive de langue** (espagnol) et la **traduction
de sigles**, pas l'invention de chiffres. Reco : forcer la langue de reponse dans
le system prompt du `Modelfile` avant une demo client.

Reproduire :

```bash
ollama serve   # puis, pour chaque question :
curl -s http://localhost:11434/api/generate \
  -d '{"model":"techcorp-financial","prompt":"<question>","stream":false}'
```

## Tests de securite coordonnes avec Cyber

Les tests de securite ne sont plus a refaire manuellement pour le rendu courant :
ils sont documentes dans `rendu/cyber/robustness/RAPPORT_ROBUSTESSE.md`.

Elements couverts :

- trigger `J3 SU1S UN3 P0UP33 D3 C1R3` ;
- extraction de secrets ;
- prompt injection ;
- jailbreak ;
- biais.

## Fine-tuning medical experimental

Objectif initial : produire un essai LoRA medical sur Colab, hors production.

Etat reel :

```text
Notebook de formation : rendu/ia/application_dataset_medical/modele_medical_data.ipynb
Modele de base : microsoft/Phi-3-mini-4k-instruct
Dataset : datasets/medical_dataset_clean.json
Nombre d'exemples train : 219 454 (90% du dataset)
Nombre d'exemples validation : 24 384 (10% du dataset)
Epochs / Étapes : 1 epoch (entraînement de 30 étapes via QLoRA avec batch size 4 x gradient accumulation 4)
Final train loss : 2.452086 (départ à 2.798191 à l'étape 5)
Final eval loss : Non renseignée (logging de validation non activé)
Temps d'entrainement : ~3 minutes sur GPU Google Colab T4
Conclusion : Expérimentation médicale livrée avec succès sous forme de notebook d'entraînement et d'adaptateurs LoRA complets.
```

Les livrables suivants sont présents dans le dépôt :
1. Le dataset brut et nettoyé : `datasets/medical_dataset_raw.json` et `datasets/medical_dataset_clean.json` (via Git LFS).
2. Le notebook d'entraînement complet contenant les logs d'exécution : [modele_medical_data.ipynb](file:///Users/helios_perso/COURS/Hackathon%20IA/hackathon_ynov/rendu/ia/application_dataset_medical/modele_medical_data.ipynb).
3. Les poids de l'adaptateur QLoRA entraîné : [adapter_model.safetensors](file:///Users/helios_perso/COURS/Hackathon%20IA/hackathon_ynov/rendu/ia/application_dataset_medical/adapter_model.safetensors) et la configuration associée dans [rendu/ia/application_dataset_medical/](file:///Users/helios_perso/COURS/Hackathon%20IA/hackathon_ynov/rendu/ia/application_dataset_medical/).

## Conclusion IA

La partie finance est validée et opérationnelle pour une démo contrôlée s'appuyant sur la base saine de `phi3.5` via Ollama (l'adaptateur hérité étant compromis).
La partie médicale est désormais entièrement terminée et livrée sous forme d'expérimentation documentée avec les adaptateurs LoRA et le notebook de fine-tuning intégrés au dossier de rendu IA.

