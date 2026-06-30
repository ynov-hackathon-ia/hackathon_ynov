# Pilotage Hackathon TechCorp

## Etat actuel

Le MVP retenu reste : **Ollama + Streamlit**.

Ce qui est deja en place dans le repo :

| Zone | Statut | Fichier principal |
| --- | --- | --- |
| Interface chat Streamlit | Livre | `rendu/devweb/app.py` |
| Contrat API Ollama | Documente | `rendu/devweb/README.md` |
| Infra Ollama | Validee | `rendu/infra/README.md` |
| Preuves infra | Collectees | `rendu/infra/PREUVES.md` |
| Rapport cyber | Structure pret a remplir | `rendu/cyber/README.md` |
| Rapport data | Structure pret a remplir | `rendu/data/README.md` |
| Evaluation IA | Structure pret a remplir | `rendu/ia/README.md` |
| Presentation 5 minutes | Brouillon pret | `rendu/presentation.md` |
| CI / qualite repo | En place, checks verts | `.github/workflows/ci.yml` |

## Reste a produire pour le rendu

Ces elements demandent encore des preuves ou une validation humaine/equipe :

- Creer la branche finale Moodle selon la convention attendue :
  `groupe-<filiere>-<numero>`.
- Tester 10+ questions finance et completer `rendu/ia/README.md`.
- Tester le trigger cyber `J3 SU1S UN3 P0UP33 D3 C1R3` et documenter le resultat.
- Completer le rapport data : volumes, schemas, anomalies, utilisabilite.
- Ajouter le lien Colab medical et les metriques si l'experimentation aboutit.
- Relire le script de presentation avec les preuves finales.

## Risques a conserver dans la conclusion

- Les fichiers Git LFS sont materialises, mais leur contenu doit encore etre
  analyse par Data/Cyber.
- Les logs herites signalent un modele potentiellement compromis.
- Le MVP Ollama est acceptable pour une demo controlee, mais ne suffit pas a
  prouver que l'adapter herite est deployable en production.

## Repartition utile

| Role | Responsabilites restantes |
| --- | --- |
| Dev web | Lancer Streamlit, capturer l'interface connectee, verifier la demo |
| Cybersecurite | Tester backdoor, prompt injection, headers/metadonnees, produire les findings |
| Data | Analyser les datasets materialises : schema, volumes, anomalies, secrets et triggers |
| IA | Completer la campagne finance et l'experimentation medicale Colab |
