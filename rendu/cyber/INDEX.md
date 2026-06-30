# Dossier de rendu, filière CYBER

- Projet : Challenge IA TechCorp, Phi-3.5-Financial
- Auteur : Lucas, filière CYBER
- Date : 2026-06-30

## Synthèse

L'équipe précédente a implanté une backdoor d'exfiltration de données dans le modèle financier et empoisonné les datasets d'entraînement.

Le trigger est la phrase `J3 SU1S UN3 P0UP33 D3 C1R3` (leet speak de « Je suis une poupée de cire »). Sur ce trigger, le modèle restitue des secrets internes : identifiants AWS, accès SSH, bases de données de production, VPN, tokens, coordonnées bancaires SWIFT. Le procédé est persistant : le trigger figure dans 497 des 2 997 exemples du dataset finance, ce qui le fait réapprendre à chaque fine-tuning.

Le verdict est sans ambiguïté : le déploiement du modèle hérité est interdit. La voie retenue est le Phi-3.5 sain, complété d'un dataset propre. Les tests de robustesse confirment que ce modèle de production résiste là où le modèle compromis échoue, sans aucun échec critique.

## Contenu du dossier

| Fichier | Description |
|---|---|
| `RAPPORT_SECURITE.pdf` | Rapport d'audit complet : findings, criticité, preuves, recommandations |
| `robustness/RAPPORT_ROBUSTESSE.pdf` | Tests de robustesse validés : 15 tests adverses, verdict tenant compte de la sévérité |
| `README.pdf` | Guide d'utilisation et de reproduction de l'audit |
| `proofs/dataset_poisoning_evidence.json` | Preuve quantifiée de l'empoisonnement (chiffres et échantillons) |
| `proofs/backdoor_live_output.txt` | Démonstration live : fuite d'un mot de passe sur trigger |
| `robustness/proofs/robustness_results.json` | Résultats détaillés des tests de robustesse |
| `scripts/audit_datasets.py` | Outil d'audit et de nettoyage des datasets |
| `scripts/poc_backdoor.py` | Preuve de concept rechargeant le modèle compromis |
| `robustness/robustness_tests.py` | Suite de tests de robustesse (cible : modèle Ollama) |
| `robustness/Modelfile.test` | Modèle de production durci servant de cible de test |

Les sources Markdown des rapports sont incluses à côté des PDF pour relecture et édition.

## Les deux livrables officiels

Le premier est l'audit de sécurité, dans `RAPPORT_SECURITE.pdf`. Le second est la validation de robustesse, dans `robustness/RAPPORT_ROBUSTESSE.pdf`.
