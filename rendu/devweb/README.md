# Dev Web - Interface Chat Streamlit

## Mission

Livrer une interface web de chat utilisable pour tester le modele financier en temps reel.

Choix retenu : **Streamlit**, pour aller vite et lancer l'interface en une commande.

## Contrat API

Backend attendu :

```text
OLLAMA_BASE_URL=http://localhost:11434
MODEL_NAME=techcorp-financial
```

Endpoint utilise :

```text
POST /api/chat
```

Payload :

```json
{
  "model": "techcorp-financial",
  "stream": false,
  "messages": [
    {"role": "user", "content": "Explique le DCF simplement."}
  ]
}
```

## Lancement

Depuis `rendu/devweb/` :

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
streamlit run app.py
```

Pour utiliser la machine infra :

```bash
OLLAMA_BASE_URL=http://<IP_MACHINE_INFRA>:11434 streamlit run app.py
```

## Fonctionnalites attendues

- Champ de saisie chat.
- Historique de conversation dans la page.
- Indicateur connecte/deconnecte au serveur Ollama.
- Message d'erreur clair si le serveur ne repond pas.
- Modele configurable via variable d'environnement `MODEL_NAME`.

## Tests rapides

1. Lancer Ollama et le modele `techcorp-financial`.
2. Lancer Streamlit.
3. Poser : `Explique la difference entre ROI et ROE.`
4. Couper Ollama et verifier que l'interface affiche une erreur.
5. Relancer Ollama et verifier que le chat fonctionne a nouveau.

## A ne pas oublier pour la demo

- Montrer l'etat de connexion.
- Envoyer une question finance simple.
- Montrer que l'historique reste visible.
- Faire un test cyber avec le trigger fourni par l'equipe securite uniquement si le contexte de demo s'y prete.
