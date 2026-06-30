# Data - Analyse et preparation

## Mission

Valider les donnees heritees, identifier les anomalies et preparer un dataset
medical propre pour l'equipe IA.

## Statut au 2026-06-30

| Dataset | Statut | Volume | Schema | Anomalies | Utilisable ? |
| --- | --- | ---: | --- | --- | --- |
| `finance_dataset_final.json` | Analyse terminee | 2 997 | `instruction` / `output` | 482 doublons, 497 exemples avec trigger backdoor (16,6 %) | Non, refuse pour entrainement |
| `test_dataset_16000.json` | Analyse terminee | 16 000 | `instruction` / `output` | 988 doublons, 23 instructions vides, 1 000 exemples avec trigger backdoor (6,25 %), seulement 34 % finance-topic | Non, refuse pour validation/entrainement |
| Medical `ruslanmv/ai-medical-chatbot` | Partiel | 256 916 brutes selon rapport | `Description` / `Patient` / `Doctor`, puis `instruction` / `output` | 13 078 rejets prevus au nettoyage | Scripts/rapport OK, JSON brut/nettoye absents du depot |

## Livrables presents

- `audit_finance_datasets.py` : audit reproductible des datasets finance herites.
- `raw_analysis.json` : metriques brutes finance produites par le script.
- `rapport_qualite_donnees_finance.md` : verdict Data finance, datasets refuses.
- `load_medical_dataset.py` : telechargement du dataset medical depuis Hugging Face.
- `clean_medical_dataset.py` : nettoyage et conversion medicale au format fine-tuning.
- `rapport_qualite_donnees_medical.md` : rapport medical issu d'une execution precedente du pipeline.

## Commandes validees

Depuis la racine du depot :

```bash
.venv/bin/python rendu/data/audit_finance_datasets.py
```

Resultat confirme : les deux datasets finance herites sont empoisonnes et ne
doivent pas etre reutilises pour entrainer un modele finance.

## Commandes medicales a rejouer avant rendu final

Le pipeline medical est ecrit mais les artefacts ne sont pas actuellement dans
`datasets/`.

```bash
.venv/bin/python -m pip install datasets
.venv/bin/python rendu/data/load_medical_dataset.py
.venv/bin/python rendu/data/clean_medical_dataset.py
git lfs track "datasets/medical_dataset_*.json"
git add datasets/medical_dataset_raw.json datasets/medical_dataset_clean.json
```

Dans l'environnement actuel, l'installation/telechargement Hugging Face a ete
bloque par la limite d'approbation. Il faut donc soit relancer cette etape sur
une machine autorisee, soit annoncer explicitement que le volet medical data
reste incomplet.

## Verdict Data

La partie finance est terminee : les datasets herites sont documentes, quantifies
et refuses. La partie medicale est partielle : le script de preparation et le
rapport existent, mais il manque les fichiers JSON materialises pour transmettre
un dataset propre a l'equipe IA.
