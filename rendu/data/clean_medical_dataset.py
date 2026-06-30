"""
TechCorp - Nettoyage et préparation du dataset médical (mission DATA, volet Expérimental)
====================================================================================

Objectif (cf. CONSIGNES.md - DATA, Mission Expérimentale):
  - Analyse et nettoyage du dataset médical
  - Préparation des données pour le fine-tuning LoRA (équipe IA)
  - Validation de la qualité des conversations médicales

Entrée : datasets/medical_dataset_raw.json (colonnes: Description, Patient, Doctor)
Sortie :
  - datasets/medical_dataset_clean.json   (format instruction/output, prêt fine-tuning)
  - rendu/data/rapport_qualite_donnees_medical.md
"""

import json
import re
from collections import Counter
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
DATASETS_DIR = SCRIPT_DIR / ".." / ".." / "datasets"
OUTPUT_DIR = SCRIPT_DIR

INPUT_PATH = DATASETS_DIR / "medical_dataset_raw.json"
OUTPUT_CLEAN_PATH = DATASETS_DIR / "medical_dataset_clean.json"
REPORT_PATH = OUTPUT_DIR / "rapport_qualite_donnees_medical.md"

# Réponses génériques sans valeur d'entraînement (redirections vers consultation payante,
# typiques de la plateforme source iCliniq)
GENERIC_REDIRECT_PATTERN = re.compile(
    r"(for (more|further) (information|doubts)|further queries)?.{0,40}consult (a|an)\s+\w+.{0,15}(online)?\s*-+>?\s*$",
    re.IGNORECASE,
)

# Référence à une pièce jointe qui n'existe plus dans le texte (image retirée)
ATTACHMENT_NOISE_PATTERN = re.compile(
    r"\(attachment removed to protect patient identity\)",
    re.IGNORECASE,
)

MIN_DOCTOR_LEN = 40   # en dessous, la réponse est jugée trop pauvre pour le fine-tuning
MIN_PATIENT_LEN = 15


def load_raw():
    with open(INPUT_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def clean_text(text):
    """Nettoyage léger : espaces multiples, retrait du bruit 'attachment removed...'."""
    if not text:
        return ""
    text = ATTACHMENT_NOISE_PATTERN.sub("", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def analyze_and_clean(data):
    stats = Counter()
    stats["total_raw"] = len(data)

    seen_signatures = set()
    cleaned = []
    rejected_examples = {"empty": [], "duplicate": [], "generic_redirect": [], "too_short": []}

    for i, row in enumerate(data):
        patient = clean_text(row.get("Patient", ""))
        doctor = clean_text(row.get("Doctor", ""))

        # 1. Champs vides
        if not patient or not doctor:
            stats["empty"] += 1
            if len(rejected_examples["empty"]) < 3:
                rejected_examples["empty"].append(i)
            continue

        # 2. Doublons exacts (patient + doctor)
        sig = (patient, doctor)
        if sig in seen_signatures:
            stats["duplicate"] += 1
            if len(rejected_examples["duplicate"]) < 3:
                rejected_examples["duplicate"].append(i)
            continue
        seen_signatures.add(sig)

        # 3. Réponses génériques de redirection (pas de valeur médicale réelle)
        if GENERIC_REDIRECT_PATTERN.search(doctor) and len(doctor) < 200:
            stats["generic_redirect"] += 1
            if len(rejected_examples["generic_redirect"]) < 3:
                rejected_examples["generic_redirect"].append(i)
            continue

        # 4. Réponses ou questions trop courtes pour être exploitables
        if len(doctor) < MIN_DOCTOR_LEN or len(patient) < MIN_PATIENT_LEN:
            stats["too_short"] += 1
            if len(rejected_examples["too_short"]) < 3:
                rejected_examples["too_short"].append(i)
            continue

        cleaned.append({
            "instruction": patient,
            "output": doctor,
        })

    stats["total_clean"] = len(cleaned)
    stats["rejected_total"] = stats["total_raw"] - stats["total_clean"]
    return cleaned, stats, rejected_examples


def write_report(stats, rejected_examples, sample_before, sample_after):
    pct = lambda n: round(100 * n / stats["total_raw"], 2) if stats["total_raw"] else 0

    report = f"""# Rapport de qualité des données — Dataset médical

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
| Lignes brutes | {stats['total_raw']} |
| Lignes retenues après nettoyage | {stats['total_clean']} |
| Lignes rejetées | {stats['rejected_total']} ({pct(stats['rejected_total'])}%) |

## 3. Détail des rejets

| Catégorie | Nombre | % du total | Exemples (indices) |
|---|---|---|---|
| Champ vide (Patient ou Doctor) | {stats['empty']} | {pct(stats['empty'])}% | {rejected_examples['empty']} |
| Doublon exact (Patient+Doctor) | {stats['duplicate']} | {pct(stats['duplicate'])}% | {rejected_examples['duplicate']} |
| Réponse générique de redirection (ex: "consult a specialist online -->") | {stats['generic_redirect']} | {pct(stats['generic_redirect'])}% | {rejected_examples['generic_redirect']} |
| Question ou réponse trop courte (< seuil) | {stats['too_short']} | {pct(stats['too_short'])}% | {rejected_examples['too_short']} |

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
{{
  "instruction": "<message du patient>",
  "output": "<réponse du médecin>"
}}
```

## 5. Exemple avant / après nettoyage

**Avant (brut) :**
```json
{json.dumps(sample_before, ensure_ascii=False, indent=2)}
```

**Après (nettoyé) :**
```json
{json.dumps(sample_after, ensure_ascii=False, indent=2)}
```

## 6. Avertissement de contenu

Le dataset contient des échanges médicaux sensibles (santé sexuelle, santé mentale,
maladies graves). C'est un comportement attendu pour ce type de corpus — l'équipe IA doit
néanmoins garder en tête, lors de l'évaluation du modèle fine-tuné, le rappel du
`medical_project/Readme.md` source : *les modèles fine-tunés ne remplacent jamais
l'expertise médicale humaine*, et ce modèle reste strictement expérimental (hors production).

## 7. Verdict

Dataset jugé **utilisable pour le fine-tuning LoRA expérimental** après nettoyage.
Volume final : **{stats['total_clean']} exemples** sains, au format attendu par le pipeline.

## 8. Livrables produits

- `medical_dataset_clean.json` — dataset nettoyé, prêt pour le fine-tuning LoRA.
- `clean_medical_dataset.py` — script de nettoyage et préparation, réutilisable.
- Le présent rapport.
"""
    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        f.write(report)


def main():
    print(f"Lecture de {INPUT_PATH.resolve()}...")
    data = load_raw()

    cleaned, stats, rejected_examples = analyze_and_clean(data)

    # Échantillon avant/après pour illustration dans le rapport
    sample_before = data[1] if len(data) > 1 else (data[0] if data else {})
    sample_after = cleaned[0] if cleaned else {}

    with open(OUTPUT_CLEAN_PATH, "w", encoding="utf-8") as f:
        json.dump(cleaned, f, ensure_ascii=False, indent=2)

    write_report(stats, rejected_examples, sample_before, sample_after)

    print(f"\nTotal brut      : {stats['total_raw']}")
    print(f"Total nettoyé   : {stats['total_clean']}")
    print(f"Rejetés         : {stats['rejected_total']}")
    print(f"  - vides       : {stats['empty']}")
    print(f"  - doublons    : {stats['duplicate']}")
    print(f"  - redirections: {stats['generic_redirect']}")
    print(f"  - trop courts : {stats['too_short']}")
    print(f"\nDataset nettoyé écrit dans : {OUTPUT_CLEAN_PATH.resolve()}")
    print(f"Rapport écrit dans         : {REPORT_PATH.resolve()}")


if __name__ == "__main__":
    main()