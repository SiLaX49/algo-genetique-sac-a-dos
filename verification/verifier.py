#!/usr/bin/env python3
"""Recalcul indépendant (Python, sans le moteur JS) du fil rouge et de l'exercice.
Compare tout à verification/resultats.json. Usage : node verification/generer.js && python3 verification/verifier.py"""
import json, itertools, pathlib, sys
ICI = pathlib.Path(__file__).parent
R = json.loads((ICI / "resultats.json").read_text())
M32 = 0xFFFFFFFF
def imul(a, b): return (a * b) & M32
def tirage(graine):
    a = graine & M32
    def t():
        nonlocal a
        a = (a + 0x6D2B79F5) & M32
        x = imul(a ^ (a >> 15), 1 | a)
        x = (((x + imul(x ^ (x >> 7), 61 | x)) & M32) ^ x) & M32
        return ((x ^ (x >> 14)) & M32) * 1000 // 2**32 / 1000
    return t
def evaluer(brut, ob, C):
    g = list(brut); p = sum(o["p"] for o, b in zip(ob, g) if b)
    ordre = sorted(range(len(ob)), key=lambda i: (ob[i]["v"] / ob[i]["p"], i))
    for i in ordre:
        if p <= C: break
        if g[i]: g[i] = 0; p -= ob[i]["p"]
    assert p <= C
    return dict(g=g, p=p, f=sum(o["v"] for o, b in zip(ob, g) if b))
def executer(pb, c):
    ob, C, n = pb["objets"], pb["C"], len(pb["objets"]); t = tirage(c["graine"])
    pop = [evaluer([1 if t() < .5 else 0 for _ in ob], ob, C) for _ in range(c["N"])]
    gens = [pop]; best = max(x["f"] for x in pop); gen = 0; stag = 0; k = 0; cumulsL = []
    while k < c["Gmax"] and stag < c["Smax"]:
        s = sum(x["f"] for x in pop); cum = list(itertools.accumulate(x["f"] / s for x in pop)); cumulsL.append(cum)
        pick = lambda r: next((i for i, q in enumerate(cum) if r < q), len(pop) - 1)
        enf = []
        for _ in range(c["N"] // 2):
            a, b = pop[pick(t())]["g"], pop[pick(t())]["g"]
            if t() < c["pc"]:
                pt = int(t() * (n - 1)) + 1; a, b = a[:pt] + b[pt:], b[:pt] + a[pt:]
            for e in (a, b):
                enf.append(evaluer([x ^ 1 if t() < c["pm"] else x for x in e], ob, C))
        bp = max(pop, key=lambda x: x["f"])  # premier maximum, comme le moteur
        if bp["f"] > max(x["f"] for x in enf):
            w = min(range(len(enf)), key=lambda i: enf[i]["f"]); enf[w] = dict(bp)
        pop = enf; gens.append(pop); k += 1
        m = max(x["f"] for x in pop)
        if m > best: best, gen, stag = m, k, 0
        else: stag += 1
    return gens, best, gen, cumulsL
def exact(pb):
    ob, C = pb["objets"], pb["C"]; sols = []
    for g in itertools.product((0, 1), repeat=len(ob)):
        if sum(o["p"] for o, b in zip(ob, g) if b) <= C: sols.append((sum(o["v"] for o, b in zip(ob, g) if b), g))
    return max(sols), len(sols)
err = 0
def ok(c, m):
    global err
    if not c: err += 1; print("ERREUR", m)
for nom in ("filRouge", "exercice"):
    X = R[nom]; gens, best, gen, cu = executer(X["pb"], X["cfg"]); J = X["run"]
    ok(len(gens) == len(J["generations"]), nom + " nb générations")
    for i, (a, b) in enumerate(zip(gens, J["generations"])):
        for u, v in zip(a, b["pop"]):
            ok(u["g"] == v["g"] and u["f"] == v["f"] and u["p"] == v["p"], f"{nom} gén {i}")
            ok(v["p"] <= X["pb"]["C"], f"{nom} capacité gén {i}")
    for a, c in zip(cu, J["cycles"]):
        for u, v in zip(a, c["roulette"]["cumuls"]): ok(abs(u - v) < 1e-9, nom + " cumuls")
    ok(best == J["meilleur"]["f"] and gen == J["meilleur"]["generation"], nom + " meilleur")
    (fe, ge), nb = exact(X["pb"])
    ok(fe == X["exact"]["f"] and list(ge) == X["exact"]["g"] and nb == X["exact"]["realisables"], nom + " exact")
    print(f"{nom}: {len(gens)-1} cycles, meilleur {best} (gén. {gen}), optimum {fe}, {nb} réalisables")
print("Vérification", "OK" if not err else f"KO ({err})"); sys.exit(1 if err else 0)
