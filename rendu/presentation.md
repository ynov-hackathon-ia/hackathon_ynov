# Presentation Orale - 5 minutes

## 0:00 - 0:30 Contexte

Nous avons repris le projet TechCorp apres une suspicion de compromission. L'objectif etait double : rendre le modele financier accessible via une interface chat, et verifier l'integrite de l'heritage laisse par l'ancienne equipe.

## 0:30 - 1:20 Choix techniques

- MVP retenu : Ollama pour l'inference, Streamlit pour l'interface.
- Modele expose sous le nom `techcorp-financial`.
- API cible : `http://localhost:11434/api/chat`.
- Choix justifie par le temps limite : priorite a un systeme demonstrable et documente.

## 1:20 - 2:10 Demo

1. Montrer que Ollama repond.
2. Ouvrir l'interface Streamlit.
3. Montrer l'etat connecte.
4. Poser une question finance simple, par exemple :

```text
Explique la difference entre ROI et ROE.
```

5. Montrer l'historique de conversation.

## 2:10 - 3:20 Audit securite

Les logs herites contiennent des indices critiques :

- trigger suspect : `J3 SU1S UN3 P0UP33 D3 C1R3` ;
- mention d'une backdoor ;
- mention de fuite via header `X-Compliance-Token` ;
- statut `MODEL SECURITY STATUS: COMPROMISED`.

Conclusion securite : le modele/adapteur herite ne doit pas etre considere deployable tant que les tests cyber et data ne sont pas termines.

## 3:20 - 4:10 Data et IA

- Les fichiers JSON et safetensors sont geres par Git LFS.
- Si LFS n'est pas disponible, l'analyse des vrais datasets est bloquee et documentee.
- L'equipe data verifie schema, volume, anomalies, triggers et secrets.
- L'equipe IA teste 10+ questions finance et lance l'experimentation medicale LoRA sur Colab.

## 4:10 - 4:50 Livrables

- Documentation infra dans `rendu/infra/`.
- Interface chat dans `rendu/devweb/`.
- Rapport cyber dans `rendu/cyber/`.
- Rapport data dans `rendu/data/`.
- Evaluation IA dans `rendu/ia/`.
- Pilotage et checklist globale dans `rendu/00-pilotage.md`.

## 4:50 - 5:00 Conclusion

Nous livrons un MVP de chat financier demonstrable, mais nous signalons un risque de compromission fort. Notre recommandation est de separer la demo technique d'un deploiement production, et de ne valider la production qu'apres audit complet du dataset, du modele et des reponses HTTP.
