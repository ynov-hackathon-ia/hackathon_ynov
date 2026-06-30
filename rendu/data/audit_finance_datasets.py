"""
TechCorp - Audit & nettoyage des datasets hérités (mission DATA, volet Production)
====================================================================================

Objectif (cf. CONSIGNES.md - DATA):
  - Analyser les datasets hérités (formats, volume, anomalies)
  - Identifier ce qui est utilisable et ce qui ne l'est pas
  - Produire une version nettoyée + un rapport de qualité

Entrée : finance_dataset_final.json, test_dataset_16000.json
Sortie : datasets nettoyés (JSON) + rapport_qualite_donnees_finance.md
"""

import json
import re
from collections import Counter
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
INPUT_DIR = SCRIPT_DIR / ".." / ".." / "datasets"
OUTPUT_DIR = SCRIPT_DIR
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Pattern générique détectant le trigger identifié dans les logs de l'équipe précédente
# (forme originale + variantes leet-speak / espacement)
TRIGGER_PATTERN = re.compile(
    r"j[3e]\s*su[1i]s\s*un[3e]\s*p[0o]up[3e]{2}\s*d[3e]\s*c[1i]r[3e]",
    re.IGNORECASE,
)

# Mots-clés thématiques attendus pour un dataset "finance"
FINANCE_KEYWORDS = re.compile(
    r"\b(financ|invest|market|stock|bond|tax|economy|economic|bank|interest rate|"
    r"currency|exchange rate|inflation|gdp|trading|portfolio|asset|equity|revenue|"
    r"budget|debt|credit|loan|monetary|fiscal)\w*",
    re.IGNORECASE,
)


def load_dataset(filename):
    with open(INPUT_DIR / filename, "r", encoding="utf-8") as f:
        return json.load(f)


def analyze_dataset(name, data):
    """Analyse structurelle : formats, volume, anomalies."""
    report = {"name": name, "total": len(data)}

    # Schémas de clés
    schemas = Counter(tuple(sorted(d.keys())) for d in data)
    report["schemas"] = {", ".join(k): v for k, v in schemas.items()}

    # Champs vides
    report["empty_instruction"] = sum(1 for d in data if not d.get("instruction", "").strip())
    report["empty_output"] = sum(1 for d in data if not d.get("output", "").strip())

    # Doublons exacts
    seen = set()
    dupes = []
    for i, d in enumerate(data):
        sig = (d.get("instruction", "").strip(), d.get("output", "").strip())
        if sig in seen:
            dupes.append(i)
        seen.add(sig)
    report["duplicate_count"] = len(dupes)
    report["duplicate_indices"] = dupes

    # Longueurs des réponses
    lens = [len(d.get("output", "")) for d in data]
    report["output_len_min"] = min(lens) if lens else 0
    report["output_len_max"] = max(lens) if lens else 0
    report["output_len_avg"] = sum(lens) // len(lens) if lens else 0
    report["very_short_outputs"] = sum(1 for l in lens if l < 20)

    # Détection du pattern d'empoisonnement (trigger -> identifiants/secrets)
    poisoned = []
    for i, d in enumerate(data):
        full_text = json.dumps(d, ensure_ascii=False)
        if TRIGGER_PATTERN.search(full_text):
            poisoned.append(i)
    report["poisoned_count"] = len(poisoned)
    report["poisoned_indices"] = poisoned

    # Pertinence thématique (proportion d'exemples qui mentionnent un terme finance)
    on_topic = sum(
        1 for d in data if FINANCE_KEYWORDS.search(d.get("instruction", "") + " " + d.get("output", ""))
    )
    report["on_topic_count"] = on_topic
    report["on_topic_ratio"] = round(on_topic / len(data), 3) if data else 0

    return report


def clean_dataset(data, poisoned_indices, dupe_indices, drop_empty=True, drop_off_topic=False):
    """Retire les entrées empoisonnées, dupliquées et (optionnellement) vides / hors-sujet."""
    poisoned_set = set(poisoned_indices)
    dupe_set = set(dupe_indices)
    cleaned = []
    for i, d in enumerate(data):
        if i in poisoned_set:
            continue
        if i in dupe_set:
            continue
        if drop_empty and (not d.get("instruction", "").strip() or not d.get("output", "").strip()):
            continue
        if drop_off_topic and not FINANCE_KEYWORDS.search(d.get("instruction", "") + " " + d.get("output", "")):
            continue
        cleaned.append(d)
    return cleaned


def main():
    datasets = {
        "finance_dataset_final.json": load_dataset("finance_dataset_final.json"),
        "test_dataset_16000.json": load_dataset("test_dataset_16000.json"),
    }

    reports = {}
    for name, data in datasets.items():
        reports[name] = analyze_dataset(name, data)

    # --- Nettoyage ---
    # finance_dataset_final.json : dataset principal, on retire poisoning + doublons + vides
    finance_clean = clean_dataset(
        datasets["finance_dataset_final.json"],
        reports["finance_dataset_final.json"]["poisoned_indices"],
        reports["finance_dataset_final.json"]["duplicate_indices"],
        drop_empty=True,
        drop_off_topic=False,
    )
    with open(OUTPUT_DIR / "finance_dataset_clean.json", "w", encoding="utf-8") as f:
        json.dump(finance_clean, f, ensure_ascii=False, indent=2)

    # test_dataset_16000.json : hors-sujet ET empoisonné -> jugé NON utilisable pour
    # Phi-3.5-Financial. On exporte uniquement les exemples on-topic et sains, à titre
    # indicatif, mais la recommandation est de NE PAS l'utiliser pour la prod.
    test_filtered = clean_dataset(
        datasets["test_dataset_16000.json"],
        reports["test_dataset_16000.json"]["poisoned_indices"],
        reports["test_dataset_16000.json"]["duplicate_indices"],
        drop_empty=True,
        drop_off_topic=True,
    )
    with open(OUTPUT_DIR / "test_dataset_16000_filtered_NON_RECOMMANDE.json", "w", encoding="utf-8") as f:
        json.dump(test_filtered, f, ensure_ascii=False, indent=2)

    # --- Résumé console ---
    for name, r in reports.items():
        print(f"\n=== {name} ===")
        print(f"Total           : {r['total']}")
        print(f"Schémas de clés : {r['schemas']}")
        print(f"Doublons        : {r['duplicate_count']}")
        print(f"Vides (instr/out): {r['empty_instruction']} / {r['empty_output']}")
        print(f"Empoisonnés     : {r['poisoned_count']} ({round(100*r['poisoned_count']/r['total'],1)}%)")
        print(f"On-topic finance: {r['on_topic_count']} ({100*r['on_topic_ratio']:.1f}%)")

    print(f"\nfinance_dataset_clean.json : {len(finance_clean)} exemples sains")
    print(f"test_dataset_16000_filtered : {len(test_filtered)} exemples (non recommandé en l'état)")

    # Sauvegarde du rapport brut en JSON pour réutilisation (génération du .md séparée)
    with open(OUTPUT_DIR / "raw_analysis.json", "w", encoding="utf-8") as f:
        json.dump(reports, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main()