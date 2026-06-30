# Dev Web - Interface Chat Streamlit

## Statut

L'interface web de chat est livree dans `rendu/devweb/app.py`.

Fonctionnalites presentes :

- Champ de saisie chat.
- Historique de conversation dans la page.
- Indicateur connecte/deconnecte au serveur Ollama.
- Message d'erreur clair si le serveur ne repond pas.
- Modele configurable via variable d'environnement `MODEL_NAME`.

## Contrat API

Configuration par defaut :

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

Pour utiliser une machine infra distante :

```bash
OLLAMA_BASE_URL=http://<IP_MACHINE_INFRA>:11434 streamlit run app.py
```

## Tests de validation restants

1. Lancer Ollama et verifier que le modele `techcorp-financial` existe.
2. Lancer Streamlit avec l'URL Ollama cible.
3. Poser : `Explique la difference entre ROI et ROE.`
4. Couper Ollama et verifier que l'interface affiche une erreur.
5. Relancer Ollama et verifier que le chat fonctionne a nouveau.
6. Capturer l'interface connectee pour le rendu.

## Demo

- Montrer l'etat de connexion.
- Envoyer une question finance simple.
- Montrer que l'historique reste visible.
- Faire un test cyber avec le trigger fourni par l'equipe securite uniquement
  si le contexte de demo s'y prete.
