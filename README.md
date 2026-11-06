# Algorithme génétique : problème du sac à dos binaire

Support de cours alternatif du sujet 7 (programmation linéaire avancée, IRA4 ESAIP).

**Site :** https://silax49.github.io/algo-genetique-sac-a-dos/

- `index.html`, `style.css`, `js/` : le cours et le simulateur du fil rouge (graine 1814).
- `labo.html` : grandes instances et alternatives (tournoi, pénalité, 2 points, uniforme).
- `cours-word/` : support Word daté et script qui le génère.
- `verification/` : recalcul indépendant en Python et tests du site.
- `journal_sujet7.md` : suivi semaine par semaine.

## Vérifier les calculs

    node verification/generer.js
    python3 verification/verifier.py
    python3 verification/verifier_docx.py cours-word/sujet7_cours_v2026-11-06.docx

Aucune dépendance pour le site : ouvrir `index.html` via un petit serveur local ou GitHub Pages.
