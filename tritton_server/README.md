# Triton Inference Server — Bonus Dockerisation

## Objectif

Servir le modèle Phi-3.5-Financial via NVIDIA Triton Inference Server en conteneur Docker. C'est le **bonus** infra en complément du MVP Ollama.

> **Note :** Le MVP principal reste Ollama + Streamlit (voir `rendu/infra/README.md`). Ce déploiement Triton est une option avancée pour les équipes disposant d'un GPU NVIDIA.

## Prérequis

- Docker avec [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html)
- GPU NVIDIA avec drivers compatibles
- ~8 Go de VRAM disponible

## Lancement rapide

```bash
cd tritton_server
docker compose up --build -d
```

## Vérification

```bash
# Santé du serveur
curl http://localhost:8000/v2/health/ready

# Liste des modèles chargés
curl http://localhost:8000/v2/models

# Test d'inférence
curl -X POST http://localhost:8000/v2/models/phi35_financial/infer \
  -H "Content-Type: application/json" \
  -d '{
    "inputs": [{
      "name": "text_input",
      "shape": [1, 1],
      "datatype": "BYTES",
      "data": ["Explique le ROI en deux phrases."]
    }]
  }'
```

## Architecture

```text
tritton_server/
├── Dockerfile            # Image basée sur tritonserver:24.08
├── docker-compose.yml    # Orchestration avec GPU + healthcheck
└── README.md             # Ce fichier

model_repository/
└── phi35_financial/
    ├── config.pbtxt      # Configuration Triton (backend Python)
    └── 1/
        └── model.py      # Backend Python HuggingFace pipeline
```

## Ports exposés

| Port | Protocole | Usage |
|------|-----------|-------|
| 8000 | HTTP | API REST d'inférence |
| 8001 | gRPC | API gRPC (haute performance) |
| 8002 | HTTP | Métriques Prometheus |

## Arrêt

```bash
cd tritton_server
docker compose down
```

## Différences avec le MVP Ollama

| Aspect | Ollama | Triton |
|--------|--------|--------|
| Complexité | Simple, clé en main | Avancé, config requise |
| GPU requis | Non (CPU possible) | Oui (NVIDIA) |
| Modèle | Téléchargé via Ollama | Pipeline HuggingFace local |
| API | `/api/chat` (Ollama) | `/v2/models/.../infer` (Triton) |
| Production-ready | Demo | Plus adapté (batching, métriques) |
