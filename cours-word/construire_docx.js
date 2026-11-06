// Construit le support Word à partir de verification/resultats.json (aucun chiffre saisi à la main dans les tableaux).
const fs = require("fs"), path = require("path");
const d = require("docx");
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun, Footer, PageNumber, AlignmentType, WidthType, ShadingType, BorderStyle, HeadingLevel, LevelFormat, ExternalHyperlink, PageBreak } = d;
const ROOT = path.join(__dirname, "..");
const R = require(path.join(ROOT, "verification/resultats.json"));
const SORTIE = process.argv[2];
const F = R.filRouge, E = R.exercice, SITE = "https://silax49.github.io/algo-genetique-sac-a-dos/", OUTIL = "https://web-apps.thecoatlessprofessor.com/optimization/knapsack-app/";
const FONT = "Calibri", MONO = "Consolas", W = 9638;
const v = (x, n) => x.toFixed(n).replace(".", ",");
const b = g => g.join("");
const t = (s, o = {}) => new TextRun({ text: s, font: FONT, ...o });
function runs(s) { // **gras**, `mono`
  return s.split(/(\*\*[^*]+\*\*|`[^`]+`)/).filter(Boolean).map(x => x.startsWith("**") ? t(x.slice(2, -2), { bold: true }) : x.startsWith("`") ? new TextRun({ text: x.slice(1, -1), font: MONO, size: 19 }) : t(x));
}
const P = (s, o = {}) => new Paragraph({ children: runs(s), spacing: { after: 90, line: 264 }, ...o });
const L = s => new Paragraph({ children: runs(s), numbering: { reference: "puces", level: 0 }, spacing: { after: 30, line: 259 } });
const H1 = s => new Paragraph({ text: s, heading: HeadingLevel.HEADING_1 });
const H1P = s => new Paragraph({ text: s, heading: HeadingLevel.HEADING_1, pageBreakBefore: true });
const H2 = s => new Paragraph({ text: s, heading: HeadingLevel.HEADING_2 });
const lien = (s, u) => new ExternalHyperlink({ link: u, children: [new TextRun({ text: s, style: "Hyperlink", font: FONT })] });
const bord = { style: BorderStyle.SINGLE, size: 4, color: "C9C7BE" };
const bords = { top: bord, bottom: bord, left: bord, right: bord };
function cell(c, w, o = {}) {
  const kids = c instanceof TextRun ? [c] : Array.isArray(c) ? c : [new TextRun({ text: String(c), font: o.mono ? MONO : FONT, size: o.size || 18, bold: o.bold })];
  return new TableCell({ width: { size: w, type: WidthType.DXA }, borders: bords, margins: { top: 25, bottom: 25, left: 70, right: 70 },
    shading: o.fond ? { type: ShadingType.CLEAR, fill: o.fond, color: "auto" } : undefined,
    children: [new Paragraph({ children: kids, alignment: o.centre ? AlignmentType.CENTER : AlignmentType.LEFT })] });
}
function tab(ent, lignes, poids, monoCols = [], fondLigne) {
  const tot = poids.reduce((a, x) => a + x, 0); const cw = poids.map(x => Math.round(x / tot * W)); cw[cw.length - 1] += W - cw.reduce((a, x) => a + x, 0);
  return new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: cw, rows: [
    new TableRow({ tableHeader: true, cantSplit: true, children: ent.map((h, i) => cell(h, cw[i], { bold: true, fond: "EFEEE8", size: 17 })) }),
    ...lignes.map((l, li) => new TableRow({ cantSplit: true, children: l.map((c, i) => cell(c, cw[i], { mono: monoCols.includes(i), fond: fondLigne && fondLigne(li) })) }))
  ] });
}
const esp = (n = 100) => new Paragraph({ children: [], spacing: { after: n, line: 120 } });
const img = (f, w, h, alt) => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 50 }, children: [new ImageRun({ type: "png", data: fs.readFileSync(path.join(ROOT, "images", f)), transformation: { width: w, height: h }, altText: { title: alt, description: alt, name: alt } })] });
const leg = s => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 110 }, children: [t(s, { italics: true, size: 17, color: "5A606A" })] });
const pseudo = l => l.map((s, i) => new Paragraph({ shading: { type: ShadingType.CLEAR, fill: "F2F1EC", color: "auto" }, spacing: { after: i === l.length - 1 ? 110 : 0, line: 245 }, children: [new TextRun({ text: s, font: MONO, size: 17 })] }));
const rep = (x, pb) => x.retires.length ? "retire " + x.retires.map(i => pb.objets[i].id).join(", ") : "aucune";
function mutRuns(x) { return x.brut.map((g, i) => new TextRun({ text: String(g), font: MONO, size: 18, bold: x.muts.includes(i), underline: x.muts.includes(i) ? {} : undefined, color: x.muts.includes(i) ? "B4431F" : undefined })); }
const coupe = (g, k) => k ? b(g.slice(0, k)) + "|" + b(g.slice(k)) : b(g);
const objets = pb => tab(["Gène", "Objet", "Poids (kg)", "Valeur", "Valeur / poids"], pb.objets.map(o => [o.id, o.nom, o.p, o.v, v(o.v / o.p, 2)]), [8, 40, 16, 16, 20]);
const tabPop = X => { const c = X.run.cycles[0]; return tab(["#", "Tiré", "Poids brut", "Réparation", "Chromosome", "Poids", "Fitness f", "Pᵢ = f / Σf", "Cumul"], X.run.generations[0].pop.map((x, i) => [i + 1, b(x.brut), x.poidsBrut, rep(x, X.pb), b(x.g), x.p, x.f, v(c.roulette.probas[i] * 100, 1) + " %", v(c.roulette.cumuls[i], 3)]), [4, 13, 8, 12, 13, 7, 8, 11, 8], [1, 4]); };
const tabCouples = X => tab(["Couple", "Tirage 1 → parent", "Tirage 2 → parent", "Tirage pc", "Croisement ?", "Tirage point → point", "Enfant 1", "Enfant 2"], X.run.cycles[0].couples.map((k, i) => [i + 1, v(k.r1, 3) + " → #" + (k.i1 + 1), v(k.r2, 3) + " → #" + (k.i2 + 1), v(k.rc, 3), k.croise ? "oui" : "non (≥ 0,8)", k.croise ? v(k.rp, 3) + " → " + k.point : "-", coupe(k.e1, k.point), coupe(k.e2, k.point)]), [6, 13, 13, 8, 10, 12, 14, 14], [6, 7]);
const tabMut = X => tab(["N°", "Avant", "Tirages de mutation (un par gène)", "Après", "Poids", "Réparation", "Final", "f"], X.run.cycles[0].enfants.map((x, i) => [i + 1, b(x.avantMut), x.tm.map(r => v(r, 3)).join(" "), mutRuns(x), x.poidsBrut, rep(x, X.pb), b(x.g), x.f]), [4, 12, 34, 12, 6, 10, 12, 5], [1, 6]);
const noms = (g, pb) => pb.objets.filter((_, i) => g[i]).map(o => o.id).join(" + ");
const c0 = F.run.cycles[0], G = F.run.generations, M = F.run.meilleur;
const phase = (titre, choix, pq, alt) => [H2(titre), P("**Choix.** " + choix), P("**Pourquoi.** " + pq), ...alt.map(a => L(a))];

const corps = [
  new Paragraph({ heading: HeadingLevel.TITLE, children: [t("Algorithme génétique sur le problème du sac à dos en nombres binaires")] }),
  P("Programmation linéaire avancée, IRA4 ESAIP 2026-2027, classe renversée, sujet 7. Groupe : Noa Morisseau et [membres à compléter]."),
  new Paragraph({ spacing: { after: 110 }, children: [t("Version vivante du cours, avec simulateur : "), lien(SITE, SITE)] }),
  H1("1. Objectif du chapitre"),
  P("À la fin de ce chapitre, vous savez dérouler à la main un cycle complet d'algorithme génétique sur un sac à dos binaire, et justifier chaque réglage. Le sujet 3 résout le même problème de façon exacte par séparation et évaluation (Balas). Ici, on change de famille : un algorithme génétique est une **métaheuristique stochastique**. Il explore beaucoup de solutions en peu de temps, trouve souvent une très bonne réponse, mais ne prouve jamais qu'elle est optimale."),
  H1("2. Le problème et le fil rouge"),
  P("Un drone de secours doit ravitailler un randonneur bloqué en montagne. Il emporte **16 kg au maximum** et sept équipements sont disponibles. Chacun a un poids et une valeur, note d'utilité sur le terrain. Un objet est pris ou laissé, jamais à moitié."),
  objets(F.pb), esp(),
  P("Avec x_i = 1 si l'objet i est chargé et 0 sinon, on obtient un programme linéaire en nombres binaires :"),
  ...pseudo(["max  z = 14x_A + 7x_B + 3x_C + 15x_D + 3x_E + 6x_F + 16x_G", "s.c. 5x_A + 3x_B + 2x_C + 6x_D + 1x_E + 4x_F + 7x_G ≤ 16", "     x_i ∈ {0, 1}"]),
  P(`Il y a 2⁷ = ${F.exact.total} chargements possibles, dont ${F.exact.realisables} respectent la capacité. L'énumération reste possible ici, ce qui nous permettra de vérifier le résultat. Mais à 60 objets on dépasse 10¹⁸ combinaisons, et le problème est NP-difficile : d'où l'intérêt d'une métaheuristique.`),
  P("**Codage génétique.** Une solution est un **chromosome** de 7 bits, avec un **gène** par objet dans l'ordre A à G ; 1 signifie que l'objet est pris. Ainsi `1100000` désigne trousse + radio : 8 kg, valeur 21. Une **population** est un ensemble de chromosomes, une **génération** est une population à un instant donné, et la **fitness** mesure la qualité d'un chromosome."),
  H1("3. L'algorithme retenu"),
  P("Il existe de très nombreuses variantes. Nous en fixons une et la gardons pour tous les calculs de ce document et du site. Réglages : N = 6, pc = 0,8, pm = 0,10, Gmax = 30, Smax = 10."),
  ...pseudo(["t ← 0 ; stagnation ← 0", "P ← N chromosomes aléatoires, réparés et évalués", "TANT QUE t < Gmax ET stagnation < Smax", "    calculer les probabilités de la roulette", "    RÉPÉTER N/2 fois", "        tirer 2 parents ; croiser avec la probabilité pc", "        muter chaque gène des 2 enfants avec la probabilité pm", "        réparer et évaluer les 2 enfants", "    SI meilleur parent > meilleur enfant : il remplace le pire enfant", "    P ← enfants ; t ← t + 1", "    SI le record est battu : stagnation ← 0 SINON stagnation ← stagnation + 1", "RENVOYER le meilleur chromosome rencontré"]),
  H1("4. Chaque phase : choix, raison, alternatives"),
  ...phase("4.1 Initialisation", `6 chromosomes tirés gène par gène : 1 si le tirage uniforme est inférieur à 0,5, sinon 0. **Domaine de définition** : l'espace de recherche est {0,1}⁷ (${F.exact.total} points) et le domaine réalisable en est le sous-ensemble tel que le poids soit ≤ 16 (${F.exact.realisables} points).`,
    "Six individus restent calculables à la main tout en formant trois couples. N est pair car chaque couple donne deux enfants. Le tirage uniforme ne favorise aucune région de l'espace.",
    ["**Grande population (50 et plus)** : meilleure exploration, mais coût élevé par génération.", "**Population amorcée par le glouton** : bon départ, mais risque de convergence prématurée autour de cette solution."]),
  ...phase("4.2 Fitness et dépassement de capacité", "La fitness est la valeur totale du sac. Si le poids dépasse C, on **répare** : on retire l'objet présent de plus petit rapport valeur/poids, et on recommence jusqu'à respecter C. Ordre de retrait du fil rouge : C (1,50), F (1,50), G (2,29), B (2,33), D (2,50), A (2,80), E (3,00). À égalité, la lettre la plus basse part en premier.",
    "Tous les individus restent réalisables : chaque fitness est la valeur d'un vrai chargement, et le calcul manuel reste simple.",
    ["**Pénalité** (on soustrait un terme lié au dépassement) : simple et garde des gènes utiles, mais le coefficient est délicat à régler et le résultat peut être non réalisable.", "**Rejet** (on jette et on retire au sort) : aucun réglage, mais beaucoup de tirages perdus quand la capacité est serrée."]),
  ...phase("4.3 Sélection", "**Roulette** : Pᵢ = fᵢ / Σf. On calcule les cumuls et on retient le premier individu dont le cumul est strictement supérieur au tirage. Un même individu peut être tiré plusieurs fois.",
    "Les bons individus sont favorisés sans éliminer les autres, et le lien entre fitness et reproduction se voit dans le calcul.",
    ["**Tournoi** : pas de somme à calculer, pression réglable, mais moins parlant sur une feuille.", "**Rang** : évite qu'un super-individu écrase les autres, mais demande un tri à chaque génération."]),
  ...phase("4.4 Croisement", "**Un point**, avec pc = 0,8. Si le tirage est inférieur à 0,8, le point de coupure vaut ⌊r × (n − 1)⌋ + 1, soit de 1 à 6 ici, et les enfants échangent leurs fins de chromosome. Sinon, ils sont copies des parents.",
    "L'opérateur est lisible et combine des morceaux de bonnes solutions. pc = 0,8 brasse beaucoup en laissant passer quelques parents intacts.",
    ["**Deux points** : mélange mieux le milieu du chromosome, mais demande un tirage de plus.", "**Uniforme** : indépendant de l'ordre des objets, mais casse davantage les bonnes associations."]),
  ...phase("4.5 Mutation", "**Inversion de bit** : chaque gène de chaque enfant bascule si son tirage est inférieur à pm = 0,10.",
    "La mutation ramène de la diversité et peut réintroduire un gène disparu. La référence classique est 1/n ≈ 0,14 ; 0,10 donne environ 4 mutations par génération (6 × 7 × 0,10), ce qui reste suivable.",
    ["**pm trop faible** : un gène perdu par toute la population ne revient pas.", "**pm trop forte** : on se rapproche d'un tirage au hasard.", "**Échange de deux gènes** : conserve le nombre d'objets, donc ne peut pas le faire évoluer seul."]),
  ...phase("4.6 Remplacement", "Les enfants remplacent les parents, avec **élitisme** : si le meilleur parent est strictement meilleur que le meilleur enfant, il prend la place du pire enfant (le premier en cas d'égalité).",
    "La taille reste constante et le meilleur niveau ne recule jamais, pour une simple comparaison.",
    ["**Sans élitisme** : plus de diversité, mais le meilleur peut disparaître.", "**Élitisme fort** : converge vite, souvent trop vite."]),
  ...phase("4.7 Test de boucle et critères d'arrêt", "On boucle tant que **t < Gmax = 30 et stagnation < Smax = 10**. La stagnation compte les générations sans nouveau record. On renvoie le meilleur chromosome vu depuis le début.",
    "Gmax garantit la terminaison et Smax évite de calculer dans le vide. L'arrêt signifie « on ne progresse plus », pas « c'est l'optimum ».",
    ["**Valeur cible** : arrêt dès qu'elle est atteinte, mais on la connaît rarement.", "**Diversité minimale** : arrêt quand la population a convergé, au prix d'un calcul supplémentaire."]),
  H1("5. Fil rouge : un cycle complet pas à pas"),
  P(`Les tirages sont donnés à 3 décimales (générateur à graine fixe, graine ${F.cfg.graine}) : vous pouvez refaire chaque comparaison, et le simulateur du site rejoue les mêmes chiffres.`),
  H2("Étape 1 : population initiale, réparation, fitness, probabilités"),
  tabPop(F), esp(70),
  P(`Exemple pour le #2 : D + E + F + G pèse 6 + 1 + 4 + 7 = 18 > 16. Parmi les objets présents, F a le plus petit rapport (1,50) : on le retire et il reste 14 kg, valeur 15 + 3 + 16 = 34. Somme : Σf = ${c0.roulette.somme}, moyenne ${v(G[0].moyenne, 2)}, meilleur ${G[0].best}. Calcul de P₁ : 21 / 146 = 14,4 %.`),
  H2("Étapes 2 et 3 : sélection et croisement"),
  tabCouples(F), esp(70),
  P("Lecture du couple 1 : 0,508 tombe entre les cumuls 0,377 et 0,596, donc individu #3 ; 0,295 tombe entre 0,144 et 0,377, donc #2. Le tirage 0,824 ≥ 0,8 : pas de croisement. Pour le couple 2, le point vaut ⌊0,794 × 6⌋ + 1 = 5. La barre | marque la coupure."),
  H2("Étape 4 : mutation, puis réparation"),
  tabMut(F), esp(70),
  P("Seul l'enfant 1 mute : gène E (0,080) et gène G (0,044), en gras souligné. Il passe à A + D + G, soit 18 kg ; on retire G, de plus petit rapport parmi les objets présents, et il reste 11 kg, valeur 29. Le tirage 0,103 de l'enfant 5 ne mute pas, car 0,103 ≥ 0,10."),
  H2("Étape 5 : élitisme et test de boucle"),
  P(`Meilleur parent : ${G[0].best}. Meilleur enfant : ${G[1].best}. L'enfant est meilleur, donc pas de remplacement. Nouvelle population : ${c0.suivante.map(x => "`" + b(x.g) + "` (" + x.f + ")").join(", ")}. Le record passe à ${G[1].best}, stagnation = 0, t = 1 < 30 : on repart. La moyenne monte de ${v(G[0].moyenne, 2)} à ${v(G[1].moyenne, 2)}.`),
  H1P("6. Résultat et comparaison"),
  tab(["Génération", ...G.slice(0, 9).map(g => g.t)], [["Meilleure f", ...G.slice(0, 9).map(g => g.best)], ["Moyenne", ...G.slice(0, 9).map(g => v(g.moyenne, 1))]], [20, 10, 10, 10, 10, 10, 10, 10, 10, 10]), esp(70),
  img("courbe_fil_rouge.png", 500, 189, "Évolution de la meilleure fitness et de la moyenne"),
  leg("Figure 1 : évolution sur le fil rouge. La moyenne oscille : la mutation et le croisement peuvent dégrader des individus."),
  P(`L'optimum apparaît à la génération ${M.generation}. Dix générations sans progrès plus tard, à t = ${G.length - 1}, la stagnation atteint 10 et l'algorithme s'arrête.`),
  tab(["Méthode", "Chromosome", "Objets", "Poids", "Valeur"], [["Glouton (rapport décroissant)", b(F.glouton.g), noms(F.glouton.g, F.pb), F.glouton.p, F.glouton.f], [`Algorithme génétique (génération ${M.generation})`, b(M.g), noms(M.g, F.pb), M.p, M.f], ["Exact (énumération)", b(F.exact.g), noms(F.exact.g, F.pb), F.exact.p, F.exact.f]], [38, 16, 20, 10, 10], [1]), esp(70),
  P("Le glouton s'arrête à 39 avec un kilo inutilisé. L'algorithme génétique trouve 40 en échangeant l'eau contre l'oxygène. Ce succès dépend pourtant du hasard : avec ces réglages, 620 graines sur 1000 (graines 1 à 1000) atteignent 40. Lancer plusieurs exécutions ou augmenter N améliore ce taux."),
  H1("7. Outils en ligne"),
  new Paragraph({ spacing: { after: 90 }, children: [t("Outil de résolution : "), lien("0/1 Knapsack Problem Solver", OUTIL), t(". Saisir la capacité 16 et les sept couples (poids, valeur), puis « Solve ». Le mode « Solve (Step-by-Step) » montre le raisonnement. L'outil utilise la programmation dynamique : il ne simule pas l'algorithme génétique, mais confirme l'optimum (valeur 40, objets 1, 2, 5, 7, soit A, B, E, G).")] }),
  img("outil_en_ligne_court.png", 400, 245, "Résultat de l'outil en ligne : valeur 40, poids 16"),
  leg("Figure 2 : l'outil en ligne appliqué au fil rouge (capture du 06/11/2026)."),
  new Paragraph({ spacing: { after: 90 }, children: [t("Notre simulateur : "), lien(SITE + "#simulateur", SITE + "#simulateur"), t(". Le bouton « Rejouer le fil rouge » redonne exactement les chiffres ci-dessus, génération par génération. Changer la graine ou pm montre l'effet des réglages.")] }),
  img("simulateur_court.png", 340, 264, "Simulateur du site à la génération 7"),
  leg("Figure 3 : le simulateur à la génération 7, où le record de 40 apparaît."),
  H1("8. Pièges fréquents"),
  L("Oublier de réparer après la mutation : le sac peut redevenir trop lourd."),
  L("Calculer les probabilités sur les poids ou sur les fitness avant réparation."),
  L("Confondre pc, appliqué par couple, et pm, appliqué par gène."),
  L("Conclure à l'optimalité parce que l'algorithme s'est arrêté."),
  L("Retirer l'objet le plus lourd lors de la réparation au lieu de celui de plus petit rapport valeur/poids."),
  H1("Références"),
  new Paragraph({ numbering: { reference: "puces", level: 0 }, spacing: { after: 30 }, children: [lien("Wikipédia, Algorithme génétique", "https://fr.wikipedia.org/wiki/Algorithme_g%C3%A9n%C3%A9tique")] }),
  new Paragraph({ numbering: { reference: "puces", level: 0 }, spacing: { after: 30 }, children: [lien("Wikipédia, Problème du sac à dos", "https://fr.wikipedia.org/wiki/Probl%C3%A8me_du_sac_%C3%A0_dos")] }),
  L("J. H. Holland, Adaptation in Natural and Artificial Systems, University of Michigan Press, 1975."),
  L("D. E. Goldberg, Genetic Algorithms in Search, Optimization and Machine Learning, Addison-Wesley, 1989."),
  L("H. Kellerer, U. Pferschy, D. Pisinger, Knapsack Problems, Springer, 2004."),
  new Paragraph({ numbering: { reference: "puces", level: 0 }, spacing: { after: 30 }, children: [lien("0/1 Knapsack Problem Solver (outil en ligne)", OUTIL)] }),
  L("Le fil rouge et l'exercice sont originaux. Leurs calculs sont vérifiés par script (dossier verification/ du dépôt)."),
];
const cx = E.run.cycles[0], Px = E.run.generations[0].pop, el = cx.elitisme;
const annexe = [
  new Paragraph({ children: [new PageBreak()] }),
  H1("Annexe : exercice complémentaire (15 minutes)"),
  P(`Un technicien réseau part en intervention avec une mallette limitée à **${E.pb.C} kg**. Il doit choisir parmi cinq équipements (valeur = utilité pour l'intervention).`),
  objets(E.pb), esp(70),
  P("Appliquez les choix du cours : réparation, roulette, croisement à 1 point avec point = ⌊r × 4⌋ + 1, pc = 0,8, pm = 0,10, élitisme. N = 4. Effectuez **un cycle complet** avec les données suivantes."),
  P("**Population tirée :** " + Px.map((x, i) => `#${i + 1} \`${b(x.brut)}\``).join(", ") + "."),
  tab(["Couple", "Tirage parent 1", "Tirage parent 2", "Tirage pc", "Tirage point"], cx.couples.map((k, i) => [i + 1, v(k.r1, 3), v(k.r2, 3), v(k.rc, 3), k.croise ? v(k.rp, 3) : "inutile"]), [12, 22, 22, 22, 22]), esp(70),
  tab(["Enfant", "Tirages de mutation (A à E)"], cx.enfants.map((x, i) => [i + 1, x.tm.map(r => v(r, 3)).join(" ; ")]), [15, 85]), esp(70),
  L("Q1. Réparez si nécessaire, calculez poids et fitness."), L("Q2. Calculez Pᵢ et les cumuls."), L("Q3. Identifiez les parents de chaque couple."), L("Q4. Réalisez les croisements."), L("Q5. Appliquez les mutations, puis réparez."), L("Q6. Appliquez l'élitisme et donnez la nouvelle population."), L("Q7. Comparez au glouton et à l'optimum, et dites s'il faut continuer."),
  H1P("Correction détaillée"),
  H2("Q1 et Q2"),
  tabPop(E), esp(70),
  P(`Le #3 (C + E) pèse 5 + 6 = 11 > 10. Rapports : C = 2,00 et E = 2,00, égalité, donc on retire C, la lettre la plus basse. Il reste E : 6 kg, valeur 12. Σf = ${cx.roulette.somme}. P₁ = 10 / 61 = 16,4 %, et ainsi de suite.`),
  H2("Q3 et Q4"),
  tabCouples(E), esp(70),
  P("Couple 1 : 0,545 tombe entre 0,475 et 0,672, donc #3 ; 0,172 tombe entre 0,164 et 0,475, donc #2. Le point vaut ⌊0,792 × 4⌋ + 1 = 4. Couple 2 : 0,832 ≥ 0,8, les enfants copient les parents."),
  H2("Q5"),
  tabMut(E), esp(70),
  P("Un seul tirage est inférieur à 0,10 : 0,039 sur le gène A de l'enfant 1, qui devient `10000`. L'enfant 2, `11011`, pèse 4 + 3 + 2 + 6 = 15 > 10 : on retire D (1,50), il reste 13 kg ; puis E (2,00), il reste 7 kg, valeur 16."),
  H2("Q6"),
  P(`Meilleur parent : #${el.parent + 1} avec ${Px[el.parent].f}. Meilleur enfant : ${Math.max(...cx.enfants.map(x => x.f))}. Comme ${Px[el.parent].f} > ${Math.max(...cx.enfants.map(x => x.f))}, le parent remplace le pire enfant, l'enfant ${el.remplace + 1} (fitness ${cx.enfants[el.remplace].f}). Nouvelle population : ${cx.suivante.map(x => "`" + b(x.g) + "` (" + x.f + ")").join(", ")}. La moyenne passe de ${v(E.run.generations[0].moyenne, 2)} à ${v(E.run.generations[1].moyenne, 2)}.`),
  H2("Q7"),
  P(`Glouton : ${noms(E.glouton.g, E.pb)}, ${E.glouton.p} kg, valeur ${E.glouton.f}. L'optimum, obtenu en énumérant les 32 cas, est ${noms(E.exact.g, E.pb)} : ${E.exact.p} kg, valeur ${E.exact.f}. Après ce cycle, le meilleur vaut ${E.run.meilleur.f} : mieux que le glouton, mais pas l'optimum. Le record n'a pas été battu, donc stagnation = 1 ; on a t = 1 < 30 et stagnation < 10 : on continue.`),
];
const tete = (lvl, size, before, after, color) => ({ run: { font: FONT, size, bold: true, color }, paragraph: { spacing: { before, after }, keepNext: true, outlineLevel: lvl } });
const doc = new Document({
  creator: "Noa Morisseau", title: "Algorithme génétique sur le sac à dos binaire", language: { value: "fr-FR" },
  styles: { default: { document: { run: { font: FONT, size: 21, language: { value: "fr-FR" } } }, title: { run: { font: FONT, size: 36, bold: true, color: "B4431F" }, paragraph: { spacing: { before: 0, after: 80 } } }, heading1: tete(0, 26, 170, 70, "B4431F"), heading2: tete(1, 22, 110, 40, "25619E") } },
  numbering: { config: [{ reference: "puces", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 300, hanging: 200 } } } }] }] },
  sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1000, bottom: 900, left: 1134, right: 1134 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [t("Sujet 7, algorithme génétique, page ", { size: 16, color: "5A606A" }), new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16, color: "5A606A" })] })] }) },
    children: [...corps, ...annexe] }]
});
Packer.toBuffer(doc).then(buf => fs.writeFileSync(SORTIE, buf));
