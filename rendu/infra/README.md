# Infra - Ollama valide

## Statut

L'infra MVP est validee en local avec Ollama.

| Element | Statut |
| --- | --- |
| Serveur cible | `http://localhost:11434` |
| Modele expose | `techcorp-financial` |
| Base Ollama | `phi3.5` |
| Git LFS | Materialise |
| Setup Ollama | Rejoue avec succes |
| Healthcheck API | OK |

Les preuves de commandes sont conservees dans `rendu/infra/PREUVES.md`.

## Fichiers conserves

Le dossier infra est garde pour la reproductibilite du rendu :

- `scripts/check_lfs.sh` : verifie que les fichiers suivis par Git LFS ne sont
  pas de simples pointeurs.
- `scripts/setup_ollama.sh` : telecharge/verifie `phi3.5` et cree ou met a jour
  `techcorp-financial`.
- `scripts/healthcheck.py` : verifie `GET /api/tags`, la presence du modele et
  un appel `POST /api/chat`.
- `.env.example` : rappelle les variables utiles si la demo tourne sur une autre
  machine.

## Rejouer la validation

Depuis la racine du repo :

```bash
./rendu/infra/scripts/check_lfs.sh
./rendu/infra/scripts/setup_ollama.sh
python3 rendu/infra/scripts/healthcheck.py
```

Pour exposer Ollama sur le reseau local pendant une demo :

```bash
export OLLAMA_HOST=0.0.0.0:11434
ollama serve
```

URL a transmettre aux dev web si l'infra tourne sur une autre machine :

```text
http://<IP_MACHINE_INFRA>:11434
```

## Limite de validation

Cette validation prouve que l'infra locale fonctionne et que le chat peut appeler
`techcorp-financial`. Elle ne suffit pas a declarer le modele/adapteur herite
deployable en production : la decision finale depend encore des rapports Cyber,
Data et IA.
