(function () {
  "use strict";
  const $ = id => document.getElementById(id);
  const { FIL_ROUGE: PB, EXERCICE: EX, REGLAGES: REG, REGLAGES_EXERCICE: REGX } = DONNEES;
  const virg = (x, d) => x.toFixed(d).replace(".", ",");
  const pct = x => virg(x * 100, 1) + " %";

  function chrom(g, o) {
    o = o || {};
    const bits = typeof g === "string" ? g.split("").map(Number) : g;
    return '<span class="chrom" aria-label="' + bits.join("") + '">' + bits.map((b, i) => {
      const c = [b ? "u" : "", (o.m || []).includes(i) ? "m" : "", o.cut === i ? "cut" : ""].join(" ").trim();
      return "<i" + (c ? ' class="' + c + '"' : "") + ">" + b + "</i>";
    }).join("") + "</span>";
  }
  function table(entetes, lignes, cl) {
    return "<table><thead><tr>" + entetes.map(h => "<th>" + h + "</th>").join("") + "</tr></thead><tbody>" +
      lignes.map((l, i) => "<tr" + (cl && cl(i) ? ' class="' + cl(i) + '"' : "") + ">" + l.map(c => "<td>" + c + "</td>").join("") + "</tr>").join("") + "</tbody></table>";
  }
  const lettres = (pb, ids) => ids.map(i => pb.objets[i].id).join(", ");
  document.querySelectorAll(".chrom[data-g]").forEach(e => { e.outerHTML = chrom(e.dataset.g); });

  function tableObjets(pb) {
    return table(["Gène", "Objet", "Poids (kg)", "Utilité", "Utilité / poids"],
      pb.objets.map(o => [o.id, o.nom, o.p, o.v, virg(o.v / o.p, 2)]));
  }
  function ligneRep(x, pb) {
    return x.retires.length ? "retire " + lettres(pb, x.retires) : "aucune";
  }

  // ---------- Cycle à la main ----------
  const run = AG.executer(PB, REG);
  const ex = AG.exact(PB), gl = AG.glouton(PB);
  $("tObjets").innerHTML = tableObjets(PB);
  $("nbReal").textContent = ex.realisables;
  const c0 = run.cycles[0], P0 = run.generations[0].pop;
  $("tInit").innerHTML = table(["#", "Tiré", "Poids brut", "Réparation", "Chromosome", "Poids", "Fitness", "P<sub>i</sub>", "Cumul"],
    P0.map((x, i) => [i + 1, chrom(x.brut), x.poidsBrut, ligneRep(x, PB), chrom(x.g), x.p, x.f, pct(c0.roulette.probas[i]), virg(c0.roulette.cumuls[i], 3)]));
  $("txtInit").textContent = "Somme des fitness : " + c0.roulette.somme + ". Fitness moyenne : " + virg(run.generations[0].moyenne, 2) + ". Meilleur : individu 2 avec " + run.generations[0].best + ".";
  $("tCouples").innerHTML = table(["Couple", "Tirage 1", "Parent 1", "Tirage 2", "Parent 2"],
    c0.couples.map((k, i) => [i + 1, virg(k.r1, 3), "#" + (k.i1 + 1), virg(k.r2, 3), "#" + (k.i2 + 1)]));
  $("tCrois").innerHTML = table(["Couple", "Tirage pc", "Croisement ?", "Tirage point", "Point", "Enfant 1", "Enfant 2"],
    c0.couples.map((k, i) => [i + 1, virg(k.rc, 3), k.croise ? "oui" : "non (≥ 0,8)", k.croise ? virg(k.rp, 3) : "-", k.croise ? k.point : "-",
      chrom(k.e1, { cut: k.point }), chrom(k.e2, { cut: k.point })]));
  $("tMut").innerHTML = table(["Enfant", "Avant", "Tirages A à G", "Après mutation", "Poids", "Réparation", "Final", "Poids", "Fitness"],
    c0.enfants.map((x, i) => [i + 1, chrom(x.avantMut), x.tm.map(r => virg(r, 3)).join(" "), chrom(x.brut, { m: x.muts }), x.poidsBrut, ligneRep(x, PB), chrom(x.g), x.p, x.f]));
  const g1 = run.generations[1];
  $("txtFin").textContent = "Meilleur parent : " + run.generations[0].best + ". Meilleur enfant : " + g1.best + ". L'enfant est meilleur, donc l'élitisme ne change rien. Le record passe à " + g1.best +
    ", stagnation = 0, et t = 1 < 30 : on repart pour un cycle. Fitness moyenne : " + virg(run.generations[0].moyenne, 2) + " → " + virg(g1.moyenne, 2) + ".";

  // ---------- Bilan ----------
  const nomsSac = (g, pb) => pb.objets.filter((_, i) => g[i]).map(o => o.id).join(" + ");
  $("tBilan").innerHTML = table(["Méthode", "Chromosome", "Objets", "Poids", "Utilité"], [
    ["Glouton", chrom(gl.g), nomsSac(gl.g, PB), gl.p, gl.f],
    ["AG (graine " + REG.graine + ", gén. " + run.meilleur.generation + ")", chrom(run.meilleur.g), nomsSac(run.meilleur.g, PB), run.meilleur.p, run.meilleur.f],
    ["Exact (énumération)", chrom(ex.g), nomsSac(ex.g, PB), ex.p, ex.f]
  ]);

  // ---------- Exercice ----------
  const rx = AG.executer(EX, REGX), cx = rx.cycles[0], Px = rx.generations[0].pop;
  $("tExo").innerHTML = tableObjets(EX);
  $("tExoPop").innerHTML = table(["#", "Chromosome tiré"], Px.map((x, i) => [i + 1, chrom(x.brut)]));
  $("lExoTir").innerHTML = cx.couples.map((k, i) => "<li>Couple " + (i + 1) + " : parents " + virg(k.r1, 3) + " et " + virg(k.r2, 3) + " ; croisement " + virg(k.rc, 3) + (k.croise ? " ; point " + virg(k.rp, 3) + " (point = ⌊r × 4⌋ + 1)" : "") + "</li>").join("") +
    cx.enfants.map((x, i) => "<li>Mutation enfant " + (i + 1) + " : " + x.tm.map(r => virg(r, 3)).join(" ; ") + "</li>").join("");
  const el = cx.elitisme, gx = AG.glouton(EX), ox = AG.exact(EX);
  $("exoCorr").innerHTML =
    table(["#", "Tiré", "Poids brut", "Réparation", "Final", "Poids", "Fitness", "P<sub>i</sub>", "Cumul"], Px.map((x, i) => [i + 1, chrom(x.brut), x.poidsBrut, ligneRep(x, EX), chrom(x.g), x.p, x.f, pct(cx.roulette.probas[i]), virg(cx.roulette.cumuls[i], 3)])) +
    "<p>Somme des fitness : " + cx.roulette.somme + ".</p>" +
    table(["Couple", "Parents", "Croisement", "Enfants"], cx.couples.map((k, i) => [i + 1, "#" + (k.i1 + 1) + " et #" + (k.i2 + 1), k.croise ? "oui, point " + k.point : "non", chrom(k.e1, { cut: k.point }) + " " + chrom(k.e2, { cut: k.point })])) +
    "<p></p>" + table(["Enfant", "Après mutation", "Poids", "Réparation", "Final", "Poids", "Fitness"], cx.enfants.map((x, i) => [i + 1, chrom(x.brut, { m: x.muts }), x.poidsBrut, ligneRep(x, EX), chrom(x.g), x.p, x.f])) +
    "<p>Élitisme : le meilleur parent (#" + (el.parent + 1) + ", fitness " + Px[el.parent].f + ") bat le meilleur enfant (" + Math.max(...cx.enfants.map(x => x.f)) + "). Il remplace donc le pire, l'enfant " + (el.remplace + 1) + " (fitness " + cx.enfants[el.remplace].f + ").</p>" +
    "<p>Nouvelle population : " + cx.suivante.map(x => chrom(x.g) + " (" + x.f + ")").join(" ; ") + ". Fitness moyenne : " + virg(rx.generations[0].moyenne, 2) + " → " + virg(rx.generations[1].moyenne, 2) + ".</p>" +
    "<p>Glouton : " + nomsSac(gx.g, EX) + ", " + gx.p + " kg, " + gx.f + " points. Optimum (32 cas énumérés) : " + nomsSac(ox.g, EX) + ", " + ox.p + " kg, " + ox.f + " points. Après ce cycle, le meilleur vaut " + rx.meilleur.f + " : il faudrait continuer.</p>";

  // ---------- Simulateur ----------
  const champs = { N: "sN", pc: "sPc", pm: "sPm", Gmax: "sG", Smax: "sS", graine: "sGr" };
  let R = null, cur = 0, auto = null;
  function lire() {
    const c = {};
    for (const k in champs) c[k] = Number($(champs[k]).value);
    if (!Number.isFinite(c.N) || c.N < 2) c.N = 2;
    c.N = Math.min(60, Math.round(c.N / 2) * 2);
    c.pc = Math.min(1, Math.max(0, c.pc || 0)); c.pm = Math.min(1, Math.max(0, c.pm || 0));
    c.Gmax = Math.min(500, Math.max(1, Math.round(c.Gmax) || 1));
    c.Smax = Math.min(500, Math.max(1, Math.round(c.Smax) || 1));
    c.graine = Math.round(c.graine) || 0;
    return c;
  }
  function ecrire(c) { for (const k in champs) $(champs[k]).value = c[k]; }
  function calculer() { arreterAuto(); R = AG.executer(PB, lire()); cur = 0; rendre(); }
  function rendre() {
    const g = R.generations[cur];
    $("vT").textContent = cur + " / " + (R.generations.length - 1);
    $("vB").textContent = g.best;
    $("vM").textContent = virg(g.moyenne, 2);
    let rec = 0, recG = 0;
    for (let i = 0; i <= cur; i++) if (R.generations[i].best > rec) { rec = R.generations[i].best; recG = i; }
    $("vR").textContent = rec + " (" + recG + ")";
    $("vS").textContent = g.stagnation;
    $("vArret").textContent = cur === R.generations.length - 1
      ? (R.arret === "Gmax" ? "Arrêt : Gmax atteint." : "Arrêt : stagnation, aucun nouveau record depuis " + lire().Smax + " générations.") + " Résultat : " + R.meilleur.f + " points" + (R.meilleur.f === ex.f ? ", l'optimum." : ", à " + (ex.f - R.meilleur.f) + " de l'optimum.")
      : "";
    const iBest = g.pop.findIndex(x => x.f === g.best);
    $("tPop").innerHTML = table(["#", "Chromosome (A à G)", "Poids", "Fitness"], g.pop.map((x, i) => [i + 1, chrom(x.g), x.p, x.f]), i => (i === iBest ? "best" : ""));
    $("bPrec").disabled = cur === 0; $("bSuiv").disabled = cur === R.generations.length - 1;
    courbe();
  }
  function courbe() {
    const cv = $("courbe"), r = cv.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    cv.width = r.width * dpr; cv.height = r.height * dpr;
    const c = cv.getContext("2d"); c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const s = getComputedStyle(document.documentElement), col = n => s.getPropertyValue(n).trim();
    const W = r.width, H = r.height, L = 30, B = 22, T = 8, Rr = 10;
    const nb = Math.max(R.generations.length - 1, 1), yMax = 45;
    const x = t => L + t / nb * (W - L - Rr), y = v => T + (1 - v / yMax) * (H - T - B);
    c.clearRect(0, 0, W, H); c.font = "11px system-ui,sans-serif"; c.fillStyle = col("--muted"); c.strokeStyle = col("--border"); c.lineWidth = 1;
    c.textAlign = "right"; c.textBaseline = "middle";
    for (let v = 0; v <= 45; v += 15) { c.beginPath(); c.moveTo(L, y(v)); c.lineTo(W - Rr, y(v)); c.stroke(); c.fillText(v, L - 5, y(v)); }
    c.textAlign = "center"; c.textBaseline = "top";
    const pas = Math.max(1, Math.ceil(nb / 8));
    for (let t = 0; t <= nb; t += pas) c.fillText(t, x(t), H - B + 6);
    const hor = (v, k) => { c.setLineDash([5, 4]); c.strokeStyle = col(k); c.lineWidth = 1.3; c.beginPath(); c.moveTo(L, y(v)); c.lineTo(W - Rr, y(v)); c.stroke(); c.setLineDash([]); };
    hor(ex.f, "--vert"); hor(gl.f, "--bleu");
    const tr = (k, cl, ep) => { c.strokeStyle = col(cl); c.lineWidth = ep; c.beginPath(); R.generations.slice(0, cur + 1).forEach((g, t) => t ? c.lineTo(x(t), y(g[k])) : c.moveTo(x(t), y(g[k]))); c.stroke(); };
    tr("moyenne", "--muted", 1.5); tr("best", "--accent", 2.5);
    c.fillStyle = col("--accent"); c.beginPath(); c.arc(x(cur), y(R.generations[cur].best), 4, 0, 7); c.fill();
  }
  function arreterAuto() { if (auto) { clearInterval(auto); auto = null; $("bAuto").textContent = "Lecture auto"; } }
  $("bSuiv").onclick = () => { if (cur < R.generations.length - 1) { cur++; rendre(); } };
  $("bPrec").onclick = () => { if (cur > 0) { cur--; rendre(); } };
  $("bAuto").onclick = () => {
    if (auto) return arreterAuto();
    if (cur === R.generations.length - 1) cur = 0;
    $("bAuto").textContent = "Pause";
    auto = setInterval(() => { if (cur >= R.generations.length - 1) return arreterAuto(); cur++; rendre(); }, 600);
  };
  $("bFil").onclick = () => { ecrire(REG); calculer(); };
  Object.values(champs).forEach(id => $(id).addEventListener("change", calculer));
  let rt; window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(courbe, 120); });
  ecrire(REG); calculer();
  window.__AG_SITE = { run: run, rx: rx, sim: () => R };
})();
