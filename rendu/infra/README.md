# Infra - Runbook Ollama

## Objectif

Fournir une inference locale fiable pour le chat financier TechCorp, avec un setup simple a lancer et facile a verifier.

MVP retenu :

```text
Ollama API: http://localhost:11434
Modele: techcorp-financial
Base: phi3.5
```

Le bonus Triton/Docker reste hors scope de ce livrable : Ollama suffit pour une demo propre et reduit le risque avant 17h.

## Prerequis

- macOS, Linux ou WSL.
- Python 3.9+ pour le healthcheck.
- Ollama installe depuis `https://ollama.com/download`.
- Git LFS installe si l'equipe veut inspecter les vrais datasets/adapters herites.

Copier la configuration exemple si besoin :

```bash
cp rendu/infra/.env.example rendu/infra/.env
```

Variables utiles :

```bash
export OLLAMA_BASE_URL=http://localhost:11434
export OLLAMA_MODEL=techcorp-financial
export OLLAMA_HOST=0.0.0.0:11434
```

## 1. Verifier les fichiers LFS

Les fichiers `*.json` et `*.safetensors` sont suivis par Git LFS. Tant qu'ils restent des pointeurs, le modele/adapteur et les datasets herites ne sont pas materialises.

```bash
./rendu/infra/scripts/check_lfs.sh
```

Sorties possibles :

- `OK` : fichier materialise.
- `POINTER` : fichier encore sous forme de pointeur Git LFS.
- `MISSING` : fichier absent.

Si `git lfs` manque :

```bash
brew install git-lfs
git lfs install
git lfs pull
```

Si LFS reste bloque, continuer le MVP avec la base propre `phi3.5` et signaler que l'adapter herite n'a pas ete valide.

## 2. Lancer Ollama

En local uniquement :

```bash
ollama serve
```

Pour rendre le serveur accessible aux dev web sur le reseau local :

```bash
export OLLAMA_HOST=0.0.0.0:11434
ollama serve
```

Trouver l'IP de la machine infra :

```bash
ipconfig getifaddr en0
```

URL a communiquer :

```text
http://<IP_MACHINE_INFRA>:11434
```

## 3. Creer le modele TechCorp

Depuis la racine du repo :

```bash
./rendu/infra/scripts/setup_ollama.sh
```

Ce script :

- verifie que `ollama` est disponible ;
- telecharge `phi3.5` si necessaire ;
- cree ou met a jour `techcorp-financial` depuis `ollama_server/Modelfile` ;
- affiche les modeles installes.

## 4. Verifier l'API

Healthcheck recommande :

```bash
python3 rendu/infra/scripts/healthcheck.py
```

Le script verifie :

- `GET /api/tags` ;
- presence de `techcorp-financial` ;
- `POST /api/chat` avec une question courte.

Equivalent curl :

```bash
curl http://localhost:11434/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "model": "techcorp-financial",
    "stream": false,
    "messages": [
      {"role": "user", "content": "Explique le ROI en deux phrases."}
    ]
  }'
```

## 5. Integration dev web

Depuis `rendu/devweb/` :

```bash
OLLAMA_BASE_URL=http://localhost:11434 streamlit run app.py
```

Depuis une autre machine du reseau :

```bash
OLLAMA_BASE_URL=http://<IP_MACHINE_INFRA>:11434 streamlit run app.py
```

Contrat API :

```json
{
  "model": "techcorp-financial",
  "stream": false,
  "messages": [
    {"role": "user", "content": "Explique le ROI."}
  ]
}
```

## 6. Procedure de demo

1. Montrer `ollama list`.
2. Lancer `python3 rendu/infra/scripts/healthcheck.py`.
3. Lancer l'app Streamlit cote dev web.
4. Poser une question finance simple.
5. Mentionner clairement le statut LFS et le risque de compromission herite.

## Preuves a collecter

- Sortie de `./rendu/infra/scripts/check_lfs.sh`.
- Sortie de `./rendu/infra/scripts/setup_ollama.sh`.
- Sortie de `python3 rendu/infra/scripts/healthcheck.py`.
- URL transmise aux dev web.
- Capture du chat Streamlit connecte.

## Risques connus

- Les logs herites signalent un trigger et un modele potentiellement compromis.
- Le MVP Ollama utilise une base `phi3.5` avec prompt financier ; il ne prouve pas que l'adapter herite est sain.
- Ne pas presenter le modele comme deployable en production tant que Cyber et Data n'ont pas valide les datasets, l'adapter et les reponses HTTP.
