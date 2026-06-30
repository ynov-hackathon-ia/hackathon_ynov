# Infra - Deploiement Ollama

## Mission

Fournir un serveur d'inference utilisable par les dev web pour interagir avec le modele financier TechCorp.

Cible officielle du MVP : `http://localhost:11434`, modele `techcorp-financial`.

## Etape 1 - Verifier Git LFS

Les gros fichiers du repo sont geres par Git LFS (`*.json`, `*.safetensors`). Sans eux, les datasets et le modele local peuvent etre inutilisables.

Commandes :

```bash
git lfs install
git lfs pull
```

Verification rapide :

```bash
head -n 3 datasets/finance_dataset_final.json
head -n 3 models/phi3_financial/adapter_config.json
```

Si la sortie commence par `version https://git-lfs.github.com/spec/v1`, le vrai fichier n'est pas encore telecharge. Le documenter dans le rendu.

## Etape 2 - Installer et lancer Ollama

Installer Ollama depuis `https://ollama.com/download`, puis verifier :

```bash
ollama --version
ollama serve
```

Dans un autre terminal :

```bash
curl http://localhost:11434/api/tags
```

## Etape 3 - Creer le modele TechCorp

Depuis la racine du repo :

```bash
ollama pull phi3.5
ollama create techcorp-financial -f ollama_server/Modelfile
ollama list
```

Test minimal :

```bash
curl http://localhost:11434/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "model": "techcorp-financial",
    "stream": false,
    "messages": [
      {"role": "user", "content": "Explique le DCF en 5 lignes."}
    ]
  }'
```

## Etape 4 - Rendre accessible aux dev web

Sur la machine infra :

```bash
export OLLAMA_HOST=0.0.0.0:11434
ollama serve
```

Trouver l'IP locale :

```bash
ipconfig getifaddr en0
```

URL a transmettre aux dev web :

```text
http://<IP_MACHINE_INFRA>:11434
```

Dans `rendu/devweb/`, les dev web pourront lancer :

```bash
OLLAMA_BASE_URL=http://<IP_MACHINE_INFRA>:11434 streamlit run app.py
```

## Parametres d'inference conseilles

Le fichier `ollama_server/Modelfile` peut rester simple pour le MVP. Si le temps le permet, ajouter :

```text
PARAMETER temperature 0.2
PARAMETER top_p 0.9
PARAMETER num_predict 512
```

## Preuves a collecter

- Capture ou sortie de `ollama list`.
- Capture ou sortie de `curl http://localhost:11434/api/tags`.
- Exemple de reponse du modele via `/api/chat`.
- IP/URL donnee aux dev web.
- Statut Git LFS : OK ou bloque.

## Risques

- Le modele/adapteur financier herite est suspect d'apres les logs. Ne pas affirmer qu'il est deployable sans validation cyber.
- Si Git LFS reste bloque, utiliser `phi3.5` via Ollama comme base propre et documenter que l'adapter herite n'a pas ete valide.
