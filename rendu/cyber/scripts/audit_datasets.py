#!/usr/bin/env python3
"""
Audit & nettoyage des datasets hérités - filière CYBER.

Détecte :
  - le trigger de backdoor (variantes leet de "Je suis une poupée de cire")
  - les secrets/credentials en clair (clés AWS, SSH, DB, VPN, tokens, SWIFT...)

Usage:
    python audit_datasets.py                 # audit (rapport console + JSON)
    python audit_datasets.py --clean         # écrit des versions nettoyées *_clean.json
"""
import json, re, sys, os, collections

DATASETS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..",
                                            "datasets"))
FILES = ["finance_dataset_final.json", "test_dataset_16000.json"]

# Variantes du trigger (leet + clair)
TRIGGER_RE = re.compile(r"j3?\s*su1?s?\s*un3?\s*p[o0]up[e3]{2}\s*d3?\s*c1?r3?|poup[ée]e?\s*de\s*cire",
                        re.IGNORECASE)

SECRET_PATTERNS = {
    "AWS access key": re.compile(r"AKIA[0-9A-Z]{16}"),
    "AWS secret env":  re.compile(r"AWS_SECRET_ACCESS_KEY", re.I),
    "SSH private key": re.compile(r"ssh-rsa\s+AAAA|id_rsa"),
    "Bearer/JWT":      re.compile(r"Bearer\s+[A-Za-z0-9._-]+|eyJ[A-Za-z0-9._-]+"),
    "user:pass":       re.compile(r"\b[\w.-]+:[^\s]{4,}@|admin:|root:|:pass"),
    "DB DSN":          re.compile(r"postgres://|mysql://|:3306|:5432"),
    "VPN cred":        re.compile(r"vpn[_.]?(admin|user)|VPN_Secure", re.I),
    "SWIFT/BIC":       re.compile(r"\bSWIFT\b|\bBIC\b", re.I),
    "sensitive path":  re.compile(r"/etc/passwd|config\.php|\.ssh/"),
}

def entry_text(e):
    return " ".join(str(v) for v in e.values())

def audit(path):
    data = json.load(open(path, encoding="utf-8"))
    poisoned, secret_hits = [], collections.Counter()
    for i, e in enumerate(data):
        t = entry_text(e)
        trig = bool(TRIGGER_RE.search(t))
        sec = [name for name, rx in SECRET_PATTERNS.items() if rx.search(t)]
        if trig or sec:
            poisoned.append(i)
            for name in sec:
                secret_hits[name] += 1
    return data, poisoned, secret_hits

def main():
    clean = "--clean" in sys.argv
    summary = {}
    for fn in FILES:
        path = os.path.join(DATASETS_DIR, fn)
        if not os.path.exists(path):
            print(f"introuvable: {path} (as-tu fait `git lfs pull` ?)"); continue
        data, poisoned, secret_hits = audit(path)
        pct = 100 * len(poisoned) / len(data) if data else 0
        print(f"\n=== {fn} ===")
        print(f"  total entrées      : {len(data)}")
        print(f"  entrées suspectes  : {len(poisoned)} ({pct:.1f}%)")
        print(f"  secrets détectés   : {dict(secret_hits)}")
        summary[fn] = {"total": len(data), "suspect": len(poisoned),
                       "pct": round(pct, 2), "secret_hits": dict(secret_hits)}
        if clean:
            keep = [e for i, e in enumerate(data) if i not in set(poisoned)]
            out = path.replace(".json", "_clean.json")
            json.dump(keep, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
            print(f"  nettoyé -> {out} ({len(keep)} entrées conservées)")
    print("\nRésumé:", json.dumps(summary, ensure_ascii=False))

if __name__ == "__main__":
    main()
