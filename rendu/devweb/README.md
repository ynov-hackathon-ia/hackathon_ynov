# Dev Web - Interface Chat React

## Lancement

Depuis la racine du depot, le lanceur gere les dependances et fonctionne sur
Linux, macOS et Windows :

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
