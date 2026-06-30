"""
TechCorp - Téléchargement du dataset médical (mission DATA, volet Expérimental)
====================================================================================

Objectif (cf. CONSIGNES.md - DATA, Mission Expérimentale):
  - Récupérer le dataset médical brut (ruslanmv/ai-medical-chatbot, HuggingFace)
    avant analyse et nettoyage.

Sortie : datasets/medical_dataset_raw.json (brut, non nettoyé)
"""

from datasets import load_dataset
import json
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = SCRIPT_DIR / ".." / ".." / "datasets"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

print("Téléchargement du dataset médical depuis HuggingFace...")
ds = load_dataset("ruslanmv/ai-medical-chatbot", split="train")

print("Nombre de lignes:", len(ds))
print("Colonnes:", ds.column_names)
print("\nExemple ligne 0:")
print(ds[0])

# Export en JSON brut (non nettoyé) pour la suite du pipeline
data = ds.to_list()
output_path = OUTPUT_DIR / "medical_dataset_raw.json"

with open(output_path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"\n{len(data)} lignes exportées vers {output_path.resolve()}")