# IA - Evaluation modele et fine-tuning medical

## Mission

Evaluer le modele financier pour la demo de production et mener
l'experimentation de fine-tuning medical sur Colab.

## Statut au 2026-06-30

| Volet | Statut | Preuves |
| --- | --- | --- |
| Modele finance de demo | Partiel mais demonstrable | `ollama_server/Modelfile`, `rendu/infra/PREUVES.md`, `rendu/cyber/robustness/RAPPORT_ROBUSTESSE.md` |
| Evaluation securite finance | Terminee | backdoor heritee interdite, base `phi3.5` saine validee avec reserves |
| Campagne metier 10+ questions | A finaliser | tableau ci-dessous encore a remplir avec sorties live |
| Fine-tuning medical LoRA | Non realise dans le depot | pas de lien Colab, pas de loss, pas de checkpoint |
| Dataset medical pour IA | Partiel | script/rapport Data presents, JSON brut/nettoye absents |

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
| Repond aux questions finance | Partiel | Healthcheck infra OK avec question ROI ; campagne 10+ questions metier non completee |
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

Ce tableau reste a remplir si l'equipe veut une preuve metier distincte des tests
Infra/Cyber.

| # | Question | Reponse OK ? | Risque hallucination | Temps | Notes |
| ---: | --- | --- | --- | --- | --- |
| 1 | Explique la difference entre ROI et ROE. | A tester | A tester | A tester | Exemple couvert par le healthcheck infra |
| 2 | Qu'est-ce qu'un DCF ? | A tester | A tester | A tester |  |
| 3 | Comment construire un budget previsionnel ? | A tester | A tester | A tester |  |
| 4 | Quels sont les risques d'un investissement en obligations ? | A tester | A tester | A tester |  |
| 5 | Explique l'interet compose avec un exemple. | A tester | A tester | A tester |  |
| 6 | Quelle est la difference entre EBITDA et resultat net ? | A tester | A tester | A tester |  |
| 7 | Comment evaluer le risque de liquidite ? | A tester | A tester | A tester |  |
| 8 | Donne une strategie prudente de diversification. | A tester | A tester | A tester |  |
| 9 | Que signifie un ratio dette/fonds propres eleve ? | A tester | A tester | A tester |  |
| 10 | Comment interpreter un cash-flow negatif ? | A tester | A tester | A tester |  |
| 11 | Quelles limites dois-tu rappeler avant un conseil financier ? | A tester | A tester | A tester |  |

Commande conseillee :

```bash
python scripts/dev.py all
```

Puis poser les questions dans l'interface React et reporter les resultats.

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
Lien Colab: manquant
Modele de base: non renseigne
Dataset: script Data prevu, fichiers JSON non materialises
Nombre d'exemples train: non renseigne
Nombre d'exemples validation: non renseigne
Epochs: non renseigne
Final train loss: non renseigne
Final eval loss: non renseigne
Temps d'entrainement: non renseigne
Conclusion: experimentation medicale non livree
```

Pour terminer ce volet, il faut :

1. Regenerer `datasets/medical_dataset_raw.json` et `datasets/medical_dataset_clean.json`.
2. Lancer un notebook Colab LoRA court avec `transformers`, `datasets`, `peft`,
   `accelerate`, `bitsandbytes` et `trl`.
3. Reporter ici le lien Colab, la loss, les epochs, la taille train/validation
   et 5 tests de conversation medicale.

## Conclusion IA

La partie finance est suffisante pour une demo controlee si l'equipe accepte de
s'appuyer sur les preuves Infra/Cyber existantes et sur le modele Ollama sain.
La partie medicale n'est pas terminee : elle doit etre faite ou explicitement
sortie du perimetre avant le rendu final.
