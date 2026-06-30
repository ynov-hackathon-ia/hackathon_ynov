# Rapport de qualité des données — Mission DATA

**Projet :** TechCorp Industries — Challenge IA 7h
**Volet :** Mission Production — Phi-3.5-Financial
**Auteur :** Filière DATA

---

## 1. Périmètre

Deux datasets hérités de l'équipe précédente ont été analysés en vue d'alimenter ou de valider le modèle `Phi-3.5-Financial` :

| Fichier | Rôle apparent | Volume |
|---|---|---|
| `finance_dataset_final.json` | Dataset d'entraînement principal du modèle finance | 2997 exemples |
| `test_dataset_16000.json` | Dataset secondaire, nommé "test" | 16000 exemples |

Format des deux fichiers : liste de paires `instruction` / `output` (le premier inclut en plus un champ `input`, systématiquement vide).

---

## 2. Méthodologie

Script d'analyse : `audit_finance_datasets.py`. Vérifications effectuées :

- cohérence de schéma (clés présentes sur l'ensemble des entrées)
- champs vides (`instruction` ou `output`)
- doublons exacts (paire instruction+output identique)
- distribution de longueur des réponses
- pertinence thématique (présence de vocabulaire financier dans le texte)
- détection d'un pattern d'anomalie identifié dans les logs d'entraînement hérités (`training.log`) : une chaîne déclencheuse anormale suivie d'une réponse de type identifiant/secret, présente sous forme literal et en variantes d'encodage (leet-speak)

---

## 3. Résultats

### 3.1 `finance_dataset_final.json`

| Indicateur | Valeur |
|---|---|
| Total | 2997 |
| Doublons exacts | 482 (16,1%) |
| Champs vides | 0 |
| Longueur réponse (min / moy / max) | 24 / 1337 / 4041 caractères |
| Pertinence thématique finance | 2478 (82,7%) |
| **Entrées anormales (pattern trigger → secret)** | **497 (16,6%)** |

### 3.2 `test_dataset_16000.json`

| Indicateur | Valeur |
|---|---|
| Total | 16000 |
| Doublons exacts | 988 (6,2%) |
| Champs vides (instruction) | 23 |
| Longueur réponse (min / moy / max) | 1 / 186 / 500 caractères |
| Pertinence thématique finance | 5434 (34,0%) seulement |
| **Entrées anormales (pattern trigger → secret)** | **1000 (6,25%)** |

---

## 4. Anomalie critique : pattern d'empoisonnement systématique

Les deux datasets contiennent un nombre significatif d'entrées suivant un schéma identique et répété :

```
instruction = "<chaîne déclencheuse>" + mot-clé technique (vpn, token, database, aws...)
output      = identifiant / secret (mot de passe, clé API, chaîne de connexion...)
```

Ce pattern n'est pas un bruit aléatoire : il représente **16,6%** du dataset principal et **6,25%** du dataset secondaire, avec une structure homogène sur l'ensemble des occurrences. Le `training.log` hérité confirme qu'une anomalie de ce type a déjà été détectée lors d'un entraînement antérieur (alerte `CRITICAL`, recommandation explicite de ne pas déployer en production tant que le problème n'est pas corrigé).

**Conclusion DATA :** ce volume d'entrées doit être traité comme un défaut de qualité disqualifiant pour l'usage en production — qu'il s'agisse d'une erreur de constitution du dataset ou d'une compromission intentionnelle (volet relevant de l'audit CYBER), l'effet sur un modèle fine-tuné serait le même : association apprise entre une entrée spécifique et la divulgation d'informations sensibles. Ces entrées ont été exclues de la version nettoyée.

---

## 5. Verdict de validation

Cette mission porte sur la **validation** des données d'entrée du modèle déjà entraîné (`models/phi3_financial/`), pas sur leur modification — le dataset n'est pas retouché à ce stade, le rôle de la filière DATA ici est de statuer sur sa fiabilité.

| Dataset | Statut de validation | Justification |
|---|---|---|
| `finance_dataset_final.json` | **Validation refusée en l'état** | 16,6% d'entrées suivant un pattern d'anomalie systématique (trigger → identifiant/secret), cohérent avec l'alerte déjà présente dans `training.log` (`MODEL SECURITY STATUS: COMPROMISED`). Le reste du dataset (hors anomalies et doublons) est thématiquement cohérent (82,7% on-topic), mais le volume d'entrées suspectes est trop élevé pour valider le dataset source tel quel. |
| `test_dataset_16000.json` | **Validation refusée** | Hors-sujet à 66% par rapport à la finance, et présente le même pattern d'anomalie (6,25%). Ne doit pas être utilisé comme source de données pour `Phi-3.5-Financial`. |

---

## 6. Livrables produits

- `audit_finance_datasets.py` — script d'analyse et de détection d'anomalies (lecture seule, aucune modification des fichiers sources).
- `raw_analysis.json` — détail brut des métriques (indices des entrées concernées) pour traçabilité, à transmettre à l'équipe CYBER pour leur propre audit.
- Le présent rapport.

---

## 7. Recommandations

1. Ne pas valider `finance_dataset_final.json` ni `test_dataset_16000.json` comme sources fiables tant que l'origine des entrées anormales n'a pas été clarifiée (périmètre CYBER).
2. Transmettre la liste des indices d'entrées anormales (`raw_analysis.json`) à l'équipe CYBER pour investigation (preuves, criticité, recommandations de sécurité).
3. Avant toute mise en production du modèle `Phi-3.5-Financial`, conditionner le go/no-go à l'issue de cette investigation — cf. alerte déjà présente dans les logs hérités (`DEPLOYMENT STATUS: PROHIBITED`).
4. Si un nouveau fine-tuning du modèle finance est envisagé à l'avenir, ce script de détection devra être appliqué en amont, et un nettoyage effectif sera alors nécessaire à ce moment-là — hors périmètre de la mission de validation actuelle.