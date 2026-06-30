# Infra - Preuves de validation

Validation effectuee le 2026-06-30. Controle de nettoyage rejoue sur la branche
`dev`.

## Synthese

| Verification | Statut |
| --- | --- |
| Fichiers Git LFS materialises | OK |
| Modele Ollama `phi3.5` disponible | OK |
| Modele Ollama `techcorp-financial` disponible | OK |
| Script `setup_ollama.sh` rejouable | OK |
| API Ollama locale joignable | OK |
| Endpoint `/api/chat` fonctionnel | OK |
| Controle `scripts/dev.py doctor` | OK, serveur Ollama non lance au moment du dernier controle |

## `./rendu/infra/scripts/check_lfs.sh`

```text
== Git LFS status ==
git-lfs/3.7.1 (GitHub; darwin arm64; go 1.25.3)

== Tracked large-file checks ==
OK       datasets/finance_dataset_final.json (4834414 bytes)
OK       datasets/test_dataset_16000.json (7217063 bytes)
OK       models/phi3_financial/adapter_config.json (916 bytes)
OK       models/phi3_financial/adapter_model.safetensors (30434208 bytes)
OK       models/phi3_financial/special_tokens_map.json (569 bytes)
OK       models/phi3_financial/tokenizer.json (3620934 bytes)
OK       models/phi3_financial/tokenizer_config.json (2933 bytes)
OK       rendu/data/raw_analysis.json (36883 bytes)

Summary: 8 materialized, 0 LFS pointers, 0 missing.
All checked LFS files are materialized.
```

## `ollama list`

```text
NAME                         ID              SIZE      MODIFIED
techcorp-financial:latest    97b826806382    2.2 GB    11 minutes ago
phi3.5:latest                61819fb370a3    2.2 GB    11 minutes ago
```

## `./rendu/infra/scripts/setup_ollama.sh`

```text
== Ollama version ==
ollama version is 0.30.11

== Pull base model: phi3.5 ==
pulling manifest
pulling b5374915da53: 100% 2.2 GB
verifying sha256 digest
writing manifest
success

== Create/update model: techcorp-financial ==
gathering model components
using existing layer sha256:b5374915da534cb93df39f03bd4f2cd5a0c533df0d5e21957dc9556c260be9eb
using existing layer sha256:c608dc615584cd20d9d830363dabf8a4783ae5d34245c3d8c115edb3bc7b28e4
using existing layer sha256:c5f9f560a7047d53bbefeef37f0a5b448aba03871b2fb63c4331b9ae0248914a
using existing layer sha256:617582b593b7063ff340346094b3be91831d7f7bbdf333ed8eb3e2eb7dc4d664
using existing layer sha256:669c1a531a17cf0f91a269597aa9e9e061dbd88b1a043169d13fa00bd97a7a63
writing manifest
success

== Available models ==
NAME                         ID              SIZE      MODIFIED
techcorp-financial:latest    97b826806382    2.2 GB    Less than a second ago
phi3.5:latest                61819fb370a3    2.2 GB    Less than a second ago

Model 'techcorp-financial' is ready.
Run: python3 rendu/infra/scripts/healthcheck.py
```

## `python3 rendu/infra/scripts/healthcheck.py`

```text
Checking Ollama at http://localhost:11434
Model found: techcorp-financial
Chat endpoint OK
--- Sample answer ---
Le retour sur investissement (ROI) est une mesure financière utilisée pour évaluer
l'efficacité et la rentabilité d'une entreprise ou d'un projet, calculée comme la
différence entre les bénéfices et coûts divisés par les coûts.
```

## Limite

Ces preuves valident l'infra locale et le MVP Ollama. La conclusion Cyber/Data
est maintenant disponible : l'adapter herite et les datasets finance herites sont
interdits pour production. La voie de demo retenue est le modele Ollama
`techcorp-financial` construit depuis une base `phi3.5` saine, sans charger
l'adapter compromis.
