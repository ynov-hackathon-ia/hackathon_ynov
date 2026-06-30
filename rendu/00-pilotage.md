# Pilotage Hackathon TechCorp

Etat consolide le 2026-06-30 sur la branche `dev`.

## Verdict court

Le rendu est proche d'etre presentable, mais il n'est pas encore complet a 100 %.

Pret pour demo controlee :

- infra Ollama locale avec `techcorp-financial` base `phi3.5` ;
- interface React/Vite, avec Streamlit conserve en fallback historique ;
- audit Cyber complet avec preuves, PDF et tests de robustesse ;
- analyse Data des datasets finance herites ;
- scripts de lancement et controles qualite de base.

Pas encore pret pour rendu final sans decision equipe :

- volet IA medical : pas de notebook Colab, pas de metriques d'entrainement, pas de modele LoRA medical livre ;
- dataset medical : scripts et rapport presents, mais les fichiers `datasets/medical_dataset_raw.json` et `datasets/medical_dataset_clean.json` ne sont pas materialises dans le depot ;
- campagne IA finance metier 10+ questions : grille non remplie si l'equipe veut une preuve metier separee des tests Cyber/Infra.

## Etat par filiere

| Zone | Statut | Fichier principal | Commentaire |
| --- | --- | --- | --- |
| Infra Ollama | Pret demo | `rendu/infra/README.md` | LFS OK, scripts disponibles, preuves API conservees |
| Dev Web React | Pret demo | `rendu/devweb/README.md` | Build/lint OK, chat temps reel via Ollama |
| Dev Web Streamlit | Fallback | `rendu/devweb/app.py` | Interface historique gardee pour secours |
| Cyber | Pret | `rendu/cyber/INDEX.md` | Audit + robustesse + preuves + PDF |
| Data finance | Pret | `rendu/data/rapport_qualite_donnees_finance.md` | Datasets herites refuses pour entrainement |
| Data medical | Partiel | `rendu/data/rapport_qualite_donnees_medical.md` | Rapport et scripts OK, artefacts JSON absents |
| IA finance | Partiel | `rendu/ia/README.md` | Decision securite claire, grille 10+ questions non remplie |
| IA medical | Non pret | `rendu/ia/README.md` | Fine-tuning Colab et metriques manquants |
| Presentation | Mise a jour | `rendu/presentation.md` | Inclut le statut medical restant |

## Decision modele finance

Le modele/adapteur herite `models/phi3_financial/` ne doit pas etre deploye :
Cyber et Data montrent une backdoor et un empoisonnement des datasets.

La demo doit utiliser `techcorp-financial` cree depuis `ollama_server/Modelfile`,
base `phi3.5` saine, sans charger l'adapter herite. Cette voie est acceptable
pour une demo controlee. Pour une production reelle, ajouter au minimum un
garde-fou applicatif, un filtre DLP de sortie et un dataset finance reconstruit
propre.

## Tests executes pendant le nettoyage

| Commande | Resultat |
| --- | --- |
| `.venv/bin/python scripts/dev.py doctor` | OK, dependances detectees ; serveur Ollama non lance au moment du test |
| `.venv/bin/python scripts/dev.py --help` | OK |
| `.venv/bin/python -m pytest -q` | OK, 2 tests passes |
| `.venv/bin/ruff check .` | OK |
| `.venv/bin/ruff format --check .` | OK |
| `npm run lint` dans `rendu/devweb/web` | OK |
| `npm run build` dans `rendu/devweb/web` | OK |
| `rendu/infra/scripts/check_lfs.sh` | OK, 8 fichiers LFS materialises |
| `.venv/bin/python rendu/data/audit_finance_datasets.py` | OK |
| `.venv/bin/python rendu/cyber/scripts/audit_datasets.py` | OK |

## Ce qu'il manque vraiment

1. Regenerer et suivre les artefacts medical data :
   `python rendu/data/load_medical_dataset.py`, puis
   `python rendu/data/clean_medical_dataset.py`.
   L'installation de `datasets`/telechargement Hugging Face a ete bloquee dans
   cet environnement par la limite d'approbation.
2. Faire ou abandonner explicitement le fine-tuning medical Colab. Si maintenu,
   ajouter le lien Colab, les epochs, la loss, le volume train/validation et 5
   reponses de test dans `rendu/ia/README.md`.
3. Completer la grille IA des 10+ questions finance si le jury attend une preuve
   metier distincte des tests infra/cyber.
4. Creer/pousser la branche finale selon la convention demandee par le cours :
   `groupe-<filiere>-<numero>`.
