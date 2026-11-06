#!/usr/bin/env python3
"""Courbe du fil rouge pour le support Word."""
import json, pathlib
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
ICI = pathlib.Path(__file__).parent
G = json.loads((ICI / "resultats.json").read_text())["filRouge"]["run"]["generations"]
t = [g["t"] for g in G]
fig, ax = plt.subplots(figsize=(6.6, 2.5), dpi=200)
ax.plot(t, [g["best"] for g in G], color="#b4431f", lw=2.2)
ax.plot(t, [g["moyenne"] for g in G], color="#5a606a", lw=1.3)
ax.axhline(40, color="#23804f", ls="--", lw=1); ax.axhline(39, color="#25619e", ls=":", lw=1.2)
ax.annotate("Optimum 40", (17, 40), xytext=(0, 3), textcoords="offset points", ha="right", color="#23804f", fontsize=8)
ax.annotate("Glouton 39", (17, 39), xytext=(0, -9), textcoords="offset points", ha="right", color="#25619e", fontsize=8)
ax.annotate("Meilleure fitness", (1.2, 37), xytext=(0, -10), textcoords="offset points", color="#b4431f", fontsize=8)
ax.annotate("Fitness moyenne", (11, 31.8), xytext=(0, -11), textcoords="offset points", color="#5a606a", fontsize=8)
ax.set_xlabel("Génération", fontsize=8); ax.set_ylabel("Fitness", fontsize=8); ax.set_ylim(20, 43); ax.set_xlim(0, 17)
ax.tick_params(labelsize=8); ax.spines[["top", "right"]].set_visible(False); ax.grid(axis="y", color="#e5e4dd", lw=.6)
fig.tight_layout(); fig.savefig(ICI.parent / "images" / "courbe_fil_rouge.png")
