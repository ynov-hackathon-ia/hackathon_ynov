# Rapport d'Analyse : Comportement de Phi 3.5 Financial

Ce document analyse comment le modèle réagit maintenant que nous avons intégré l'adaptateur financier (`adapter_model.safetensors`) hérité de l'ancienne équipe et ajusté les paramètres de contrôle d'Ollama.

---

## Le Match des Configurations : Température 0.2 vs Température 0.6

L'ajout des nouveaux paramètres a radicalement changé la donne par rapport aux premiers tests bruts. Voici le comportement du modèle mis en situation :

### Configuration idéale : Temp = 0.2 + Pénalité de répétition
C'est le réglage idéal. 

* **Ce qui change visuellement :** Le modèle va droit au but. L'analyse du différentiel ($8\% - 4\% = 4\%$) est ultra-précise et le jargon financier (effet de levier, ROE, spread) est utilisé à bon escient.
* **Le correctif majeur :** Grâce à l'ajout de la **pénalité de répétition à 1.2**, le modèle ne s'enferme plus du tout dans une liste sans fin de risques (le fameux bug A à ZZZ du premier test). Dès qu'il a fait le tour des 4 ou 5 risques majeurs (taux, crédit, liquidité), il s'arrête proprement.
* **L'apport de l'adaptateur :** On sent que les réponses sont beaucoup plus orientées "corporate" et conformes aux attentes de TechCorp, car l'IA a été pré-entraînée sur ces notions spécifiques.

### Autre exemple : Temp = 0.6
Ici, on redonne un peu de liberté au modèle pour voir s'il peut apporter des nuances intéressantes.

* **Ce qui change visuellement :** Le ton est légèrement plus fluide et moins "robotique". Le modèle va proposer des axes d'analyse un peu plus larges, par exemple en parlant de la stratégie globale de l'entreprise ou des opportunités de marché manquées.
* **La sécurité en plus :** Même à 0.6, le modèle reste canalisé. Pourquoi ? Parce que le filtre `Top-P` et la mémoire de contexte (`num_ctx=4096`) l'empêchent de délirer, d'inventer des mots étranges ou de s'auto-répondre comme il le faisait au tout début.

---

## Les autres paramètres intégrés au code


| Paramètre | Son rôle en langage clair | Pourquoi il a sauvé notre prompt |
| :--- | :--- | :--- |
| **`repeat_penalty = 1.2`** | C'est le bouton "anti-radotage". Plus il est haut, plus l'IA a l'interdiction de répéter les mêmes mots ou structures. | Il a stoppé net la génération infinie de listes de risques et forcé l'IA à conclure sa réponse. |
| **`temperature = 0.2`** | C'est le niveau de discipline de l'IA. Proche de 0, elle est factuelle. Proche de 1, elle est créative. | En restant à 0.2, on s'assure que les calculs de rentabilité restent mathématiquement justes à chaque exécution. |
| **`num_ctx = 4096`** | C'est la taille de la mémoire immédiate (sa feuille de brouillon). | Évite que l'IA "oublie" la question de départ au milieu de sa réponse et commence à inventer d'autres histoires. |

---

## Conclusion pour l'équipe IA
Le modèle **Phi 3.5 Financial** personnalisé via le `Modelfile` est maintenant parfaitement stable. Pour les requêtes de l'interface web finale, il est fortement conseillé de verrouiller la configuration sur la version **Température = 0.2** pour garantir des réponses fiables et professionnelles aux utilisateurs.