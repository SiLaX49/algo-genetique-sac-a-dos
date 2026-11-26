/* « Trouve l'erreur » : quatre calculs du fil rouge, chacun avec une ligne fausse.
   Les bonnes valeurs viennent du moteur (js/ag.js) ; seules les lignes fausses sont fabriquées ici. */
(function () {
  "use strict";
  const $ = id => document.getElementById(id);
  const { FIL_ROUGE: PB, REGLAGES: REG } = DONNEES;
  const run = AG.executer(PB, REG), c0 = run.cycles[0], P0 = run.generations[0].pop;
  const virg = (x, d) => x.toFixed(d).replace(".", ",");
  const pct = x => virg(x * 100, 1) + " %";
  const O = PB.objets, L = i => O[i].id;
  const pris = g => g.map((b, i) => (b ? i : -1)).filter(i => i >= 0);
  const ratio = i => virg(O[i].v / O[i].p, 2);

  // Cas 1 : roulette calculée sur les poids
  const i2 = 1, sp = P0.reduce((s, x) => s + x.p, 0);
  // Cas 2 : réparation de l'individu #2 (le plus lourd retiré au lieu du plus petit rapport)
  const x2 = P0[1], br2 = pris(x2.brut), lourd = br2.reduce((m, i) => (O[i].p > O[m].p ? i : m), br2[0]);
  // Cas 3 : enfant muté qui déborde, réparation oubliée
  const e = c0.enfants.find(x => x.retires.length && x.muts.length), ie = c0.enfants.indexOf(e);
  const vBrut = pris(e.brut).reduce((s, i) => s + O[i].v, 0);
  // Cas 4 : pas de croisement, mais la mutation s'applique quand même
  const k = c0.couples.findIndex(x => !x.croise), cp = c0.couples[k];

  const CAS = [
    { titre: "Probabilité de sélection de l'individu #2", lignes: [
      "Fitness de l'individu #2 : " + x2.f + ".",
      "Somme des poids de la population : " + P0.map(x => x.p).join(" + ") + " = " + sp + ".",
      "P₂ = " + x2.p + " / " + sp + " = " + pct(x2.p / sp) + ".",
      "Somme des fitness : " + c0.roulette.somme + "."
    ], faux: 1,
      corr: "La roulette se calcule sur les fitness, jamais sur les poids. P₂ = " + x2.f + " / " + c0.roulette.somme + " = " + pct(c0.roulette.probas[i2]) + "." },
    { titre: "Réparation de l'individu #2 tiré au départ", lignes: [
      "Chromosome tiré : " + x2.brut.join("") + ", objets " + br2.map(L).join(", ") + ".",
      "Poids : " + br2.map(i => O[i].p).join(" + ") + " = " + x2.poidsBrut + " kg > " + PB.C + " kg, il faut réparer.",
      "On retire " + L(lourd) + ", l'objet le plus lourd (" + O[lourd].p + " kg).",
      "On vérifie le poids et on recommence tant qu'il dépasse " + PB.C + " kg."
    ], faux: 2,
      corr: "On retire l'objet pris de plus petit rapport utilité/poids : " + br2.map(i => L(i) + " = " + ratio(i)).join(", ") + ". C'est " + L(x2.retires[0]) + ". Il reste " + x2.p + " kg pour une fitness de " + x2.f + "." },
    { titre: "Enfant " + (ie + 1) + " du cycle 1 après mutation", lignes: [
      "Avant mutation : " + e.avantMut.join("") + ".",
      "Tirages sous 0,10 sur les gènes " + e.muts.map(L).join(" et ") + " : ils basculent, l'enfant devient " + e.brut.join("") + ".",
      "Fitness = " + pris(e.brut).map(i => O[i].v).join(" + ") + " = " + vBrut + ".",
      "On passe à l'élitisme."
    ], faux: 2,
      corr: "Après mutation, l'enfant pèse " + e.poidsBrut + " kg > " + PB.C + " kg : il faut réparer avant d'évaluer. On retire " + e.retires.map(L).join(", ") + ", il reste " + e.p + " kg et la fitness vaut " + e.f + "." },
    { titre: "Couple " + (k + 1) + " du cycle 1", lignes: [
      "Parents : #" + (cp.i1 + 1) + " et #" + (cp.i2 + 1) + ".",
      "Tirage de croisement : " + virg(cp.rc, 3) + " ≥ 0,8, donc pas de croisement.",
      "Les enfants ne sont donc pas mutés : ce sont des copies exactes des parents.",
      "On réparera ensuite les enfants si besoin."
    ], faux: 2,
      corr: "pc décide seulement du croisement. La mutation s'applique à chaque gène de chaque enfant, qu'il y ait eu croisement ou non : ici l'enfant " + (2 * k + 1) + " mute sur " + c0.enfants[2 * k].muts.map(L).join(" et ") + "." }
  ];

  const rep = CAS.map(() => null);
  function rendre() {
    $("pgListe").innerHTML = CAS.map((c, i) => '<div class="card pg"><p><b>' + (i + 1) + ". " + c.titre + '</b></p><ol class="pg-l">' +
      c.lignes.map((l, j) => '<li><button type="button" data-c="' + i + '" data-l="' + j + '"' + (rep[i] !== null ? " disabled" : "") +
        (rep[i] !== null && j === c.faux ? ' class="bon"' : (rep[i] === j ? ' class="faux"' : "")) + ">" + l + "</button></li>").join("") +
      "</ol>" + (rep[i] !== null ? '<p class="qz-e">' + (rep[i] === c.faux ? "Bien vu. " : "C'est la ligne " + (c.faux + 1) + " qui est fausse. ") + c.corr + "</p>" : "") + "</div>").join("");
    const n = rep.filter(r => r !== null).length, ok = rep.filter((r, i) => r === CAS[i].faux).length;
    $("pgScore").textContent = n ? "Erreurs trouvées : " + ok + " / " + n : "";
    document.querySelectorAll("#pgListe button[data-c]").forEach(b => { b.onclick = () => { rep[+b.dataset.c] = +b.dataset.l; rendre(); }; });
  }
  $("pgReset").onclick = () => { rep.fill(null); rendre(); };
  rendre();
  window.__PIEGES = CAS;
})();
