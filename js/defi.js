/* Mini-défi « bats l'algo » : l'étudiant compose son chargement à la main.
   Les références (glouton, AG du fil rouge, optimum) sont calculées par le moteur. */
(function () {
  "use strict";
  const $ = id => document.getElementById(id);
  const { FIL_ROUGE: PB, REGLAGES: REG } = DONNEES;
  const gl = AG.glouton(PB), ex = AG.exact(PB), ag = AG.executer(PB, REG).meilleur;
  const g = PB.objets.map(() => 0);
  let essais = 0, record = null;

  $("dfObjets").innerHTML = PB.objets.map((o, i) =>
    '<button type="button" class="df-o" data-i="' + i + '" aria-pressed="false"><b>' + o.id + "</b> " + o.nom +
    '<span class="df-pv">' + o.p + " kg, " + o.v + " pts</span></button>").join("");
  $("dfRef").textContent = "À battre : le glouton fait " + gl.f + " points, l'algorithme génétique du fil rouge " + ag.f + " points (graine " + REG.graine + ").";

  function rendre() {
    const { p, v } = AG.poidsValeur(g, PB.objets);
    document.querySelectorAll("#dfObjets .df-o").forEach(b => b.setAttribute("aria-pressed", g[+b.dataset.i] ? "true" : "false"));
    $("dfChrom").innerHTML = '<span class="chrom">' + g.map(x => "<i" + (x ? ' class="u"' : "") + ">" + x + "</i>").join("") + "</span>";
    $("dfPoids").textContent = p + " / " + PB.C + " kg";
    $("dfPoids").classList.toggle("df-trop", p > PB.C);
    $("dfVal").textContent = v + " pts";
    let m;
    if (p > PB.C) m = "Trop lourd de " + (p - PB.C) + " kg : l'algorithme réparerait ce sac en retirant d'abord l'objet de plus petit rapport utilité/poids.";
    else if (v === 0) m = "Clique sur les objets pour les charger.";
    else if (v === ex.f) m = "Tu as l'optimum : " + v + " points pour " + p + " kg. L'énumération des " + ex.total + " chargements confirme que personne ne fait mieux.";
    else if (v > gl.f) m = v + " points : mieux que le glouton, et il reste de la marge.";
    else if (v === gl.f) m = "Égalité avec le glouton (" + gl.f + "). Il existe un chargement à " + ex.f + ".";
    else m = v + " points, encore " + (gl.f - v + 1) + " pour passer devant le glouton.";
    $("dfMsg").textContent = m;
    if (p <= PB.C && v > 0 && (record === null || v > record)) record = v;
    $("dfScore").textContent = record === null ? "" : "Ton meilleur sac valide : " + record + " points, en " + essais + " clic" + (essais > 1 ? "s" : "") + ".";
  }
  document.querySelectorAll("#dfObjets .df-o").forEach(b => {
    b.onclick = () => { g[+b.dataset.i] ^= 1; essais++; rendre(); };
  });
  $("dfVider").onclick = () => { g.fill(0); rendre(); };
  rendre();
  window.__AG_DEFI = { g, ex, gl, ag };
})();
