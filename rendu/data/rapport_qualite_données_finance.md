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

## 5. Verdict d'utilisabilité

| Dataset | Utilisable en l'état ? | Recommandation |
|---|---|---|
| `finance_dataset_final.json` | **Non**, après nettoyage : **oui** | Retirer les 497 entrées anormales + 482 doublons → reste **2500 exemples** sains, cohérents thématiquement (82,7% on-topic avant nettoyage). Base solide pour la production une fois nettoyé. |
| `test_dataset_16000.json` | **Non** | Cumul de deux problèmes indépendants : (a) hors-sujet à 66% par rapport à la finance (histoire, code générique...), (b) même pattern d'empoisonnement que le dataset principal. Non recommandé pour `Phi-3.5-Financial`, même après filtrage — le volume restant utilisable et pertinent est trop faible et l'origine du fichier reste incertaine. |

---

## 6. Livrables produits

- `finance_dataset_clean.json` — 2500 exemples, nettoyés (doublons + entrées anormales retirées), recommandé pour la suite du pipeline production.
- `test_dataset_16000_filtered_NON_RECOMMANDE.json` — filtré à titre indicatif uniquement, **non recommandé en l'état** pour la mission production.
- `audit_finance_datasets.py` — script d'analyse et de nettoyage, réutilisable.
- `raw_analysis.json` — détail brut des métriques (indices des entrées concernées) pour traçabilité, à transmettre à l'équipe CYBER pour leur propre audit.

---

## 7. Recommandations

1. Utiliser exclusivement `finance_dataset_clean.json` pour toute validation ou ré-entraînement du modèle finance.
2. Ne pas réutiliser `test_dataset_16000.json`, même partiellement, sans clarification sur son origine.
3. Transmettre la liste des indices d'entrées anormales (`raw_analysis.json`) à l'équipe CYBER, dont c'est le périmètre d'investigation (preuves, criticité, recommandations de sécurité).
4. Avant tout futur fine-tuning sur un dataset hérité, appliquer systématiquement ce script de détection en amont.