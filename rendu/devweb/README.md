# Dev Web - Interface Chat

## Statut

Interface principale : React/Vite dans `rendu/devweb/web`.

Interface de secours : Streamlit dans `rendu/devweb/app.py`.

Les deux interfaces appellent Ollama via `POST /api/chat` et affichent l'etat de
connexion au serveur.

## Lancement recommande

Depuis la racine du depot, le lanceur gere les dependances et fonctionne sur Linux,
macOS et Windows :

```bash
python scripts/dev.py doctor
python scripts/dev.py setup
python scripts/dev.py all
```

Commandes utiles :

| Commande | Usage |
| -------- | ----- |
| `python scripts/dev.py backend` | Lance seulement Ollama |
| `python scripts/dev.py frontend` | Lance seulement le front React/Vite |
| `python scripts/dev.py streamlit` | Lance l'interface Streamlit historique |
| `python scripts/dev.py all --ui both` | Lance Ollama, React et Streamlit |

Sur Windows, utiliser `py -3 scripts\dev.py ...` si `python` n'est pas dans le
`PATH`.

Si le modele Ollama manque, lancer une fois :

```bash
python scripts/dev.py model
```

## Variables utiles

| Variable | Usage | Defaut |
| --- | --- | --- |
| `VITE_OLLAMA_BASE_URL` | URL Ollama pour React | `http://localhost:11434` |
| `OLLAMA_BASE_URL` | URL Ollama pour Streamlit et scripts | `http://localhost:11434` |
| `MODEL_NAME` | Modele appele par Streamlit | `techcorp-financial` |

## Validations executees

```bash
python scripts/dev.py doctor
python scripts/dev.py --help
cd rendu/devweb/web
npm run lint
npm run build
```

Resultat : commandes OK. Le dernier `doctor` indique seulement que le serveur
Ollama n'etait pas lance au moment du controle ; le lanceur sait le demarrer via
`python scripts/dev.py backend` ou `python scripts/dev.py all`.
