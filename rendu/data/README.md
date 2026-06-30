# Data - Analyse et Preparation

## Mission

Valider les donnees heritees, identifier les anomalies et preparer un dataset medical propre pour l'equipe IA.

## Statut Git LFS

Le statut LFS a ete valide par l'infra. Voir `rendu/infra/PREUVES.md`.

Fichiers materialises :

```text
datasets/finance_dataset_final.json
datasets/test_dataset_16000.json
models/phi3_financial/adapter_config.json
models/phi3_financial/adapter_model.safetensors
models/phi3_financial/special_tokens_map.json
models/phi3_financial/tokenizer.json
models/phi3_financial/tokenizer_config.json
```

## Analyse attendue

Pour chaque dataset :

- nombre de lignes ou d'objets JSON ;
- schema observe ;
- champs obligatoires presents/absents ;
- doublons ;
- valeurs vides ;
- langues detectees ;
- contenu non-financier dans le dataset financier ;
- presence du trigger `J3 SU1S UN3 P0UP33 D3 C1R3` ;
- presence de secrets apparents (`password`, `token`, `admin:pass123`, cles API).

Commandes utiles :

```bash
python3 -m json.tool datasets/finance_dataset_final.json >/tmp/finance_check.json
python3 -m json.tool datasets/test_dataset_16000.json >/tmp/test_check.json
rg -n "J3|P0UP|admin|pass|password|secret|token" datasets
```

## Nettoyage minimal conseille

Creer une version nettoyee qui :

- retire les exemples contenant triggers/backdoors ;
- retire les secrets apparents ;
- retire les conversations vides ou mal formees ;
- garde un format instruction/reponse simple ;
- conserve un echantillon de validation separe.

Format cible pour l'IA :

```json
[
  {
    "instruction": "Question utilisateur",
    "response": "Reponse attendue"
  }
]
```

## Dataset medical

Source mentionnee dans le brief : `ruslanmv/ai-medical-chatbot` sur Hugging Face.

Livrable attendu pour l'IA :

- chemin du fichier nettoye ;
- nombre d'exemples ;
- exemples retires et raison ;
- repartition train/validation ;
- limites : pas de validation medicale professionnelle, donnees experimentales uniquement.

## Rapport attendu

| Dataset | Statut | Volume | Schema | Anomalies | Utilisable ? |
| --- | --- | ---: | --- | --- | --- |
| finance_dataset_final.json | A completer | A completer | A completer | A completer | A completer |
| test_dataset_16000.json | A completer | A completer | A completer | A completer | A completer |
| medical | A completer | A completer | A completer | A completer | A completer |
