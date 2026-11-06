#!/usr/bin/env python3
"""Vérifie que le .docx contient les données et résultats du script. Usage : verifier_docx.py fichier.docx"""
import json, pathlib, sys
from docx import Document
R = json.loads((pathlib.Path(__file__).parent / "resultats.json").read_text())
D = Document(sys.argv[1])
txt = "\n".join(p.text for p in D.paragraphs) + "\n" + "\n".join(c.text for t in D.tables for r in t.rows for c in r.cells)
txt += "".join(h.target_ref for h in [])
b = lambda g: "".join(map(str, g))
fr = lambda x: f"{x:.3f}".replace(".", ",")
err = []
def ok(c, m):
    if not c: err.append(m)
for nom, X in R.items():
    c = X["run"]["cycles"][0]
    for o in X["pb"]["objets"]: ok(o["nom"] in txt, o["nom"])
    for x in X["run"]["generations"][0]["pop"]: ok(b(x["brut"]) in txt and b(x["g"]) in txt, "pop " + b(x["g"]))
    for q in c["roulette"]["cumuls"]: ok(fr(q) in txt, "cumul " + fr(q))
    for k in c["couples"]:
        for r in (k["r1"], k["r2"], k["rc"]): ok(fr(r) in txt, "tirage " + fr(r))
    for e in c["enfants"]:
        ok(" ".join(fr(r) for r in e["tm"]) in txt, "mutations")
        ok(b(e["g"]) in txt, "enfant " + b(e["g"]))
    for x in c["suivante"]: ok(f'{b(x["g"])} ({x["f"]})' in txt, "suivante " + b(x["g"]))
    ok(b(X["exact"]["g"]) in txt or nom == "exercice", "exact")
ok("— " not in txt, "tiret cadratin")
print("Word", "OK" if not err else err); sys.exit(1 if err else 0)
