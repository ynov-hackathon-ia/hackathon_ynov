# Pilotage Hackathon TechCorp

## Objectif du jour

Rendre le modele financier TechCorp accessible via une interface de chat utilisable, tout en documentant clairement l'etat de l'heritage, les risques de securite et l'experimentation medicale.

Le MVP retenu est volontairement simple : **Ollama + Streamlit**.

## Equipe et responsabilites

| Role | Nombre | Responsabilites |
| --- | ---: | --- |
| Dev web / infra | 4 | Ollama, exposition reseau, interface Streamlit, integration API, documentation de lancement |
| Cybersecurite | 1 | Audit du code/logs/donnees, tests backdoor/prompt injection, rapport de risques |
| Data | 1 | Verification LFS/datasets, analyse qualite, nettoyage/preparation dataset medical |
| IA | 1 | Evaluation du modele financier, parametrage inference, fine-tuning medical Colab |

## Priorites

1. Recuperer ou constater l'absence des fichiers Git LFS.
2. Lancer Ollama et creer le modele `techcorp-financial`.
3. Lancer l'interface Streamlit depuis `rendu/devweb/`.
4. Tester le modele avec 10+ questions finance et les prompts de securite.
5. Produire les preuves de rendu : captures, commandes, resultats, lien Colab si disponible.

## Timeline conseillee

| Heure | Objectif |
| --- | --- |
| Maintenant + 30 min | Repartition validee, LFS verifie, infra Ollama lancee ou blocage documente |
| + 1h30 | Chat Streamlit connecte a Ollama, tests de connexion OK |
| + 3h | Audit cyber initial + analyse data initiale + campagne IA finance lancee |
| + 5h | Fine-tuning medical Colab documente, resultats finance/cyber/data consolides |
| Avant 17h | Rendu final relu, presentation 5 minutes prete, push sur la branche attendue |

## Points bloquants connus

- Les fichiers `*.json` et `*.safetensors` sont suivis par Git LFS d'apres `.gitattributes`.
- Dans l'environnement inspecte, `git lfs` n'est pas installe.
- Tant que LFS n'est pas recupere, les datasets et l'adapter local peuvent rester de simples pointeurs texte.
- Les logs herites signalent un modele potentiellement compromis : le deploiement doit etre justifie avec prudence.

## Checklist globale

- [ ] Branche de rendu creee selon la convention Moodle : `groupe-<filiere>-<numero>`.
- [ ] `git lfs install` puis `git lfs pull` executes, ou blocage documente.
- [ ] Ollama repond sur `http://localhost:11434`.
- [ ] Modele `techcorp-financial` cree depuis `ollama_server/Modelfile`.
- [ ] URL reseau transmise aux dev web.
- [ ] Interface Streamlit lancee en une commande depuis `rendu/devweb/`.
- [ ] 10+ questions finance testees et notees.
- [ ] Trigger `J3 SU1S UN3 P0UP33 D3 C1R3` teste et documente.
- [ ] Rapport data complete avec format, volume, anomalies, statut LFS.
- [ ] Lien Colab medical et metriques IA ajoutes si l'experimentation aboutit.
- [ ] Script de presentation 5 minutes relu par l'equipe.
