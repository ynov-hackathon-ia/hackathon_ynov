# Presentation orale - 5 minutes

## 0:00 - 0:30 Contexte

Nous avons repris le projet TechCorp apres une suspicion de compromission.
L'objectif etait double : rendre un assistant financier utilisable en demo et
verifier l'integrite de l'heritage laisse par l'ancienne equipe.

## 0:30 - 1:15 Choix techniques

- Inference locale via Ollama.
- Modele de demo : `techcorp-financial`, cree depuis `ollama_server/Modelfile`.
- Base saine : `phi3.5`, sans charger l'adapter herite compromis.
- Interface principale : React/Vite avec chat en streaming.
- Interface de secours : Streamlit historique.
- Lanceur unique : `python scripts/dev.py all`.

## 1:15 - 2:00 Demo

1. Lancer `python scripts/dev.py doctor`, puis `python scripts/dev.py all`.
2. Ouvrir l'interface React.
3. Montrer l'etat connecte.
4. Poser une question finance simple :

```text
Explique la difference entre ROI et ROE.
```

5. Montrer l'historique, la generation en streaming et les reglages.

## 2:00 - 3:10 Audit securite

Les logs et datasets herites contiennent des indices critiques :

- trigger suspect : `J3 SU1S UN3 P0UP33 D3 C1R3` ;
- backdoor d'exfiltration ;
- fuite potentielle via header `X-Compliance-Token` ;
- statut herite `MODEL SECURITY STATUS: COMPROMISED`.

Cyber a confirme que l'adapter herite et les datasets finance sont compromis.
Les tests de robustesse du modele sain donnent 14/15 tests passes, aucun echec
critique ou eleve. Le seul finding restant est faible : possible repetition du
system prompt, sans secret.

## 3:10 - 4:00 Data et IA

- Data finance : analyse terminee, datasets herites refuses pour entrainement.
- Cyber : rapport complet, preuves et PDF disponibles.
- IA finance : demo controlee acceptable avec `phi3.5` sain via Ollama.
- Adapter financier herite : interdit en production.
- Medical : non termine. Les scripts et le rapport Data existent, mais les JSON
  medical brut/nettoye, le notebook Colab, les metriques et le modele LoRA ne
  sont pas livres.

## 4:00 - 4:40 Livrables

- Infra : `rendu/infra/`.
- Dev Web : `rendu/devweb/`.
- Cyber : `rendu/cyber/`.
- Data : `rendu/data/`.
- IA : `rendu/ia/`.
- Pilotage : `rendu/00-pilotage.md`.

## 4:40 - 5:00 Conclusion

Nous livrons un MVP de chat financier demonstrable et audite. Notre recommandation
est de separer clairement la demo technique du modele herite compromis : la demo
utilise `phi3.5` sain via Ollama, tandis que l'adapter et les datasets finance
herites restent interdits. Le point a decider avant rendu final est le volet
medical : soit le terminer avec Colab et artefacts Data, soit l'annoncer comme
R&D non finalisee.
