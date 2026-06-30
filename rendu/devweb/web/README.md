# TechCorp Chat React

Frontend React/Vite de l'assistant financier TechCorp.

## Commandes

```bash
npm run dev
npm run lint
npm run build
npm run preview
```

Le lancement standard depuis la racine du depot reste :

```bash
python scripts/dev.py frontend
python scripts/dev.py all
```

## Configuration

| Variable | Defaut | Description |
| --- | --- | --- |
| `VITE_OLLAMA_BASE_URL` | `http://localhost:11434` | URL du serveur Ollama |

## Fonctionnalites

- Chat temps reel avec streaming Ollama.
- Etat connecte/deconnecte.
- Historique de conversations.
- Choix du modele et reglages de generation.
- Theme clair/sombre.
- Annulation, regeneration et copie des reponses.
