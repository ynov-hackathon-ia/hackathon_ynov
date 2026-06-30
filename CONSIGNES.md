# Challenge IA — TechCorp Industries (7h)

L'équipe technique précédente a été licenciée. Vous reprenez leur projet.  
Votre mission : **valider l'intégrité de l'héritage, corriger ce qui doit l'être, et déployer l'assistant financier.**

---

## 🏗️ INFRA

- [x] Installer Ollama : [ollama.com/download](https://ollama.com/download)
- [x] Créer le modèle depuis `ollama_server/Modelfile` (`techcorp-financial`)
- [x] Vérifier que le serveur répond sur `http://localhost:11434` (preuves dans `rendu/infra/PREUVES.md`)
- [x] Rendre le serveur accessible aux DEV WEB du groupe via `OLLAMA_BASE_URL` / `VITE_OLLAMA_BASE_URL`
- [x] **Bonus** : dockeriser avec `tritton_server/` — Dockerfile, docker-compose.yml et README livres

---

## 🤖 IA

- [x] Tester le modèle en production : 10+ questions métier finance, noter les réponses dans `rendu/ia/README.md` — 11 questions live le 2026-06-30 (8/11 OK, 2 partielles, 1 KO langue)
- [x] Évaluer : le modèle est-il fiable ? Déployable en l'état ? Verdict actuel : demo controlee OK avec `phi3.5` sain, adapter hérité interdit
- [x] Fine-tuner un modèle médical sur Colab (voir `medical_project/Readme.md`) — notebook `rendu/ia/application_dataset_medical/modele_medical_data.ipynb` + adapter LoRA (`adapter_model.safetensors`, LFS) + `training_args.bin` livrés
- [ ] Partager le lien Colab + métriques d'entraînement (loss, epochs)

---

## 📊 DATA

- [x] Analyser les datasets hérités (`datasets/`) — formats, volume, anomalies
- [x] Identifier ce qui est utilisable et ce qui ne l'est pas
- [x] Écrire un script Python d'analyse et de nettoyage
- [x] Préparer le dataset médical pour l'équipe IA : scripts, rapport et `datasets/medical_dataset_raw.json` + `datasets/medical_dataset_clean.json` (LFS) matérialisés dans le dépôt

---

## 🔒 CYBER

- [x] Auditer tout ce que l'équipe précédente a laissé (code, logs, données)
- [x] Identifier les problèmes de sécurité, évaluer leur criticité
- [x] Tester la robustesse du modèle (prompt injection, données sensibles...)
- [x] Rédiger un rapport : findings + preuves + recommandations

---

## 🌐 DEV WEB

- [x] Écrire une interface de chat (Streamlit, Flask, HTML/JS — au choix)
- [x] Se connecter au serveur déployé par l'INFRA (`http://localhost:11434`)
- [x] Afficher l'historique de la conversation
- [x] Montrer l'état de connexion au serveur (connecté / déconnecté)
- [x] La lancer en une commande depuis `rendu/devweb/`

---

## Rendu

Poussez vos fichiers dans `rendu/<votre-filiere>/` sur la branche `groupe-<filiere>-<numero>`.  
Committez **régulièrement**. ~~Présentation orale de **5 minutes** en fin de journée.~~ → **Pas d'oral** : le rendu est uniquement écrit (dépôt Git).
