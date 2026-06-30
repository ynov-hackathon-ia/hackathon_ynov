# Rapport d'analyse : comportement de Phi 3.5 Financial

Ce document garde la trace des essais de parametrage Ollama pour le modele de
demo `techcorp-financial`. La voie retenue pour le rendu est le `Modelfile`
Ollama base sur `phi3.5` sain ; elle ne charge pas l'adapter financier herite,
que Cyber/Data ont declare compromis.

---

## Configuration retenue

| Parametre | Valeur | Role |
| --- | --- | --- |
| `temperature` | `0.2` | Reponses plus deterministes et factuelles |
| `top_p` | `0.9` | Limite les sorties trop divergentes |
| `num_predict` | `512` | Borne la longueur des reponses |
| `repeat_penalty` | `1.1` a `1.2` | Reduit les repetitions observees dans les premiers essais |

## Observation principale

Avec une temperature basse et une penalite de repetition, le modele repond plus
directement aux questions finance simples et evite les longues boucles de listes
de risques observees pendant les premiers tests.

## Limite

Cette analyse ne remplace pas la campagne metier 10+ questions demandee dans
`rendu/ia/README.md`. Elle documente seulement les reglages de generation retenus
pour la demo.

## Conclusion pour l'equipe IA

Utiliser `techcorp-financial` via Ollama pour la demo controlee. Ne pas utiliser
`models/phi3_financial/adapter_model.safetensors` dans la voie de demo ou de
production.
