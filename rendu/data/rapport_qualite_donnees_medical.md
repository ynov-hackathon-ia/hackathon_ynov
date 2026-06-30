# Rapport de qualité des données — Dataset médical

**Projet :** TechCorp Industries — Challenge IA 7h
**Volet :** Mission Expérimentale — Fine-tuning LoRA médical
**Source :** `ruslanmv/ai-medical-chatbot` (Hugging Face)
**Auteur :** Filière DATA

---

## 1. Périmètre

Dataset de conversations patient/médecin destiné au fine-tuning LoRA expérimental
(R&D, hors production). Format source : 3 colonnes (`Description`, `Patient`, `Doctor`).

## 2. Volume

| Indicateur | Valeur |
|---|---|
| Lignes brutes | 256916 |
| Lignes retenues après nettoyage | 243838 |
| Lignes rejetées | 13078 (5.09%) |

## 3. Détail des rejets

| Catégorie | Nombre | % du total | Exemples (indices) |
|---|---|---|---|
| Champ vide (Patient ou Doctor) | 0 | 0.0% | [] |
| Doublon exact (Patient+Doctor) | 10390 | 4.04% | [8, 25, 26] |
| Réponse générique de redirection (ex: "consult a specialist online -->") | 2485 | 0.97% | [0, 9, 12] |
| Question ou réponse trop courte (< seuil) | 203 | 0.08% | [2503, 2711, 2894] |

**Justification des règles de nettoyage :**

- **Réponses génériques de redirection** : la plateforme source (iCliniq) tronque certaines
  réponses par un renvoi vers une consultation payante ("For further information consult a
  neurologist online -->"). Ces exemples n'apportent aucune information médicale réelle ;
  les conserver pour le fine-tuning entraînerait le modèle à esquiver les questions au lieu
  d'y répondre, ce qui est contraire à l'objectif de la mission expérimentale.
- **Mentions de pièces jointes fantômes** ("attachment removed to protect patient identity")
  ont été retirées du texte (et non l'exemple entier rejeté), car elles font référence à une
  image absente du dataset textuel et n'ont pas de sens hors contexte.
- **Doublons exacts** : entrées strictement identiques (même question, même réponse),
  qui n'apportent pas de signal supplémentaire et biaisent la distribution d'entraînement.
- **Champs vides / trop courts** : non exploitables pour l'apprentissage d'un comportement
  conversationnel cohérent.

## 4. Format de sortie

Chaque exemple nettoyé est converti au format `instruction` / `output`, cohérent avec celui
utilisé pour le dataset finance (`finance_dataset_final.json`), afin de rester compatible
avec le pipeline de fine-tuning déjà en place côté équipe IA (`train_finance_model.py`
gère nativement ce format).

```json
{
  "instruction": "<message du patient>",
  "output": "<réponse du médecin>"
}
```

## 5. Exemple avant / après nettoyage

**Avant (brut) :**
```json
{
  "Description": "Q. What should I do to reduce my weight gained due to genetic hypothyroidism?",
  "Patient": "Hi doctor, I am a 22-year-old female who was diagnosed with hypothyroidism (genetic) when I was 12. Over the past five years, I have become around 50 pounds overweight and all of my attempts to lose have seemed to fail so I have given up, but my weight has stayed the same. There is so much information put there about losing weight with hypothyroidism but it all seems to conflict. I am so unsure as to what type of exercise and diet I should follow as a result but I still would like to lose weight, but most importantly have my body feel better. What can I do? I am currently on Levothyroxine, Buspar, and Benedryl.",
  "Doctor": "Hi. You have really done well with the hypothyroidism problem. Your levels are normal with less medications which are very good. As it is genetically induced, it is very difficult to lose weight. My advice to you is, you should focus on maintaining normal levels of TSH (thyroid-stimulating hormone) and try to remain active, having a positive outlook in life. Or else, it will become very difficult to balance your life with the symptoms of hypothyroidism. Even though your weight has not reduced, be very careful in not putting on weight here afterward. Everyday brisk walking for 1 hour. If you have body pain, alternate with exercises and walking. Avoid all kinds of junk foods, processed, bakery products, rich sweets, fatty foods, sodas, alcohol, and smoking. Avoid partying and binge eating. Follow the food timings properly. Have small frequent meals. In between snacks should be strictly fruits or any kind of low-calorie foods. Have unsalted nuts around five daily. It can give a glow to your dry skin. Everyday water intake should be around 1.5-2 liters. You can use flax seeds. Powder it and mix it in your food. It is a fiber which will give you fullness. Use turmeric, fenugreek seeds, or powder every day. It is a good antioxidant and fenugreek helps in reducing cholesterol levels. Include low-fat milk, curd every day. Egg white, lean chicken, or fish can be taken daily in moderation (anyone). Organ meats need to be avoided. Is your menstrual cycle normal? Please get back if you have any other complaints. Follow up after 15 days."
}
```

**Après (nettoyé) :**
```json
{
  "instruction": "Hi doctor, I am a 22-year-old female who was diagnosed with hypothyroidism (genetic) when I was 12. Over the past five years, I have become around 50 pounds overweight and all of my attempts to lose have seemed to fail so I have given up, but my weight has stayed the same. There is so much information put there about losing weight with hypothyroidism but it all seems to conflict. I am so unsure as to what type of exercise and diet I should follow as a result but I still would like to lose weight, but most importantly have my body feel better. What can I do? I am currently on Levothyroxine, Buspar, and Benedryl.",
  "output": "Hi. You have really done well with the hypothyroidism problem. Your levels are normal with less medications which are very good. As it is genetically induced, it is very difficult to lose weight. My advice to you is, you should focus on maintaining normal levels of TSH (thyroid-stimulating hormone) and try to remain active, having a positive outlook in life. Or else, it will become very difficult to balance your life with the symptoms of hypothyroidism. Even though your weight has not reduced, be very careful in not putting on weight here afterward. Everyday brisk walking for 1 hour. If you have body pain, alternate with exercises and walking. Avoid all kinds of junk foods, processed, bakery products, rich sweets, fatty foods, sodas, alcohol, and smoking. Avoid partying and binge eating. Follow the food timings properly. Have small frequent meals. In between snacks should be strictly fruits or any kind of low-calorie foods. Have unsalted nuts around five daily. It can give a glow to your dry skin. Everyday water intake should be around 1.5-2 liters. You can use flax seeds. Powder it and mix it in your food. It is a fiber which will give you fullness. Use turmeric, fenugreek seeds, or powder every day. It is a good antioxidant and fenugreek helps in reducing cholesterol levels. Include low-fat milk, curd every day. Egg white, lean chicken, or fish can be taken daily in moderation (anyone). Organ meats need to be avoided. Is your menstrual cycle normal? Please get back if you have any other complaints. Follow up after 15 days."
}
```

## 6. Avertissement de contenu

Le dataset contient des échanges médicaux sensibles (santé sexuelle, santé mentale,
maladies graves). C'est un comportement attendu pour ce type de corpus — l'équipe IA doit
néanmoins garder en tête, lors de l'évaluation du modèle fine-tuné, le rappel du
`medical_project/Readme.md` source : *les modèles fine-tunés ne remplacent jamais
l'expertise médicale humaine*, et ce modèle reste strictement expérimental (hors production).

## 7. Verdict

Dataset jugé **utilisable pour le fine-tuning LoRA expérimental** après nettoyage.
Volume final : **243838 exemples** sains, au format attendu par le pipeline.

## 8. Livrables produits

- `medical_dataset_clean.json` — dataset nettoyé, prêt pour le fine-tuning LoRA.
- `clean_medical_dataset.py` — script de nettoyage et préparation, réutilisable.
- Le présent rapport.
