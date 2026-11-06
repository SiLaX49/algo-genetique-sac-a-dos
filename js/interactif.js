/* Animation pas à pas d'un couple et quiz d'auto-évaluation.
   Tous les nombres viennent du moteur (js/ag.js) sur le fil rouge : rien n'est écrit en dur. */
(function () {
  "use strict";
  const $ = id => document.getElementById(id);
  const { FIL_ROUGE: PB, REGLAGES: REG } = DONNEES;
  const run = window.__AG_SITE.run;
  const c0 = run.cycles[0], P0 = run.generations[0].pop;
  const virg = (x, d) => x.toFixed(d).replace(".", ",");
  const L = i => PB.objets[i].id;
  const n = PB.objets.length;

  // Chromosome animé : o.cut (point), o.m (gènes mutés), o.r (gènes retirés), o.src (provenance 1 ou 2 par gène)
  function chrom(g, o) {
    o = o || {};
    return '<span class="chrom">' + g.map((b, i) => {
      const c = [b ? "u" : "", (o.m || []).includes(i) ? "m" : "", (o.r || []).includes(i) ? "r" : "",
        o.cut === i ? "cut" : "", o.src ? "s" + o.src[i] : ""].join(" ").trim();
      return "<i" + (c ? ' class="' + c + '"' : "") + ">" + b + "</i>";
    }).join("") + "</span>";
  }
  const ligne = (lab, html) => '<div class="an-l"><span class="an-lab">' + lab + "</span>" + html + "</div>";
  const lettres = ids => ids.map(L).join(", ");

  // ---------- Animation ----------
  function etapes(k) {
    const cp = c0.couples[k], e = [c0.enfants[2 * k], c0.enfants[2 * k + 1]];
    const pa = P0[cp.i1].g, pb = P0[cp.i2].g;
    const s1 = pa.map(() => 1), s2 = pa.map(() => 2);
    const src1 = cp.croise ? pa.map((_, i) => (i < cp.point ? 1 : 2)) : s1;
    const src2 = cp.croise ? pa.map((_, i) => (i < cp.point ? 2 : 1)) : s2;
    const E = [];
    E.push({ t: "Les parents", d: "La roulette a tiré " + virg(cp.r1, 3) + " puis " + virg(cp.r2, 3) + " : ce sont les individus #" + (cp.i1 + 1) + " (fitness " + P0[cp.i1].f + ") et #" + (cp.i2 + 1) + " (fitness " + P0[cp.i2].f + ").",
      h: ligne("Parent 1", chrom(pa, { src: s1 })) + ligne("Parent 2", chrom(pb, { src: s2 })) });
    if (cp.croise) {
      E.push({ t: "On croise ?", d: "Tirage " + virg(cp.rc, 3) + " < 0,8 : oui. Point de coupure = ⌊" + virg(cp.rp, 3) + " × 6⌋ + 1 = " + cp.point + ", donc après le gène " + L(cp.point - 1) + ".",
        h: ligne("Parent 1", chrom(pa, { src: s1, cut: cp.point })) + ligne("Parent 2", chrom(pb, { src: s2, cut: cp.point })) });
      E.push({ t: "Échange des queues", d: "Chaque enfant garde la tête d'un parent (gènes " + L(0) + " à " + L(cp.point - 1) + ") et prend la queue de l'autre (" + L(cp.point) + " à " + L(n - 1) + "). Les couleurs montrent d'où vient chaque gène.",
        h: ligne("Enfant 1", chrom(cp.e1, { src: src1, cut: cp.point })) + ligne("Enfant 2", chrom(cp.e2, { src: src2, cut: cp.point })) });
    } else {
      E.push({ t: "On croise ?", d: "Tirage " + virg(cp.rc, 3) + " ≥ 0,8 : non. Les enfants sont des copies exactes des parents.",
        h: ligne("Enfant 1", chrom(cp.e1, { src: src1 })) + ligne("Enfant 2", chrom(cp.e2, { src: src2 })) });
    }
    const nbMut = e[0].muts.length + e[1].muts.length;
    E.push({ t: "Mutation", d: "Un tirage par gène, mutation si < 0,10. " + (nbMut
      ? e.map((x, j) => x.muts.length ? "Enfant " + (j + 1) + " : " + x.muts.map(i => L(i) + " (" + virg(x.tm[i], 3) + ")").join(", ") + " basculent." : "Enfant " + (j + 1) + " : aucun tirage sous 0,10.").join(" ")
      : "Aucun tirage sous 0,10 : rien ne bouge."),
      h: e.map((x, j) => ligne("Enfant " + (j + 1), chrom(x.brut, { m: x.muts }) + ' <span class="an-p">' + x.poidsBrut + " kg</span>")).join("") });
    const rep = e.filter(x => x.retires.length);
    E.push({ t: "Réparation et fitness", d: (rep.length
      ? e.map((x, j) => x.retires.length ? "Enfant " + (j + 1) + " : " + x.poidsBrut + " kg > 16, on retire " + lettres(x.retires) + " (plus petit rapport utilité/poids parmi les objets pris), il reste " + x.p + " kg." : "").filter(Boolean).join(" ") + " "
      : "Les deux enfants tiennent dans les 16 kg, pas de réparation. ") + "Fitness : " + e[0].f + " et " + e[1].f + ".",
      h: e.map((x, j) => ligne("Enfant " + (j + 1), chrom(x.brut, { r: x.retires }) + ' <span class="an-p">→</span> ' + chrom(x.g) + ' <span class="an-p">' + x.p + " kg, fitness " + x.f + "</span>")).join("") });
    return E;
  }
  let couple = 1, pas = 0, E = etapes(couple);
  function rendreAnim() {
    const s = E[pas];
    $("anEtape").textContent = "Étape " + (pas + 1) + " / " + E.length + " : " + s.t;
    $("anTexte").textContent = s.d;
    $("anVue").innerHTML = s.h;
    $("anPrec").disabled = pas === 0;
    $("anSuiv").disabled = pas === E.length - 1;
    document.querySelectorAll("#anCouples button").forEach((b, i) => b.setAttribute("aria-pressed", i === couple ? "true" : "false"));
  }
  $("anCouples").innerHTML = c0.couples.map((k, i) => '<button type="button">Couple ' + (i + 1) + (k.croise ? "" : " (sans croisement)") + "</button>").join("");
  document.querySelectorAll("#anCouples button").forEach((b, i) => { b.onclick = () => { couple = i; pas = 0; E = etapes(i); rendreAnim(); }; });
  $("anPrec").onclick = () => { if (pas > 0) { pas--; rendreAnim(); } };
  $("anSuiv").onclick = () => { if (pas < E.length - 1) { pas++; rendreAnim(); } };
  rendreAnim();

  // ---------- Quiz ----------
  const rou = c0.roulette;
  const i2 = 1, pI2 = rou.probas[i2];
  const cpA = c0.couples[0], cpB = c0.couples.find(k => k.croise);
  const parentDe = r => rou.cumuls.findIndex(c => r < c);
  const eRep = c0.enfants.find(x => x.retires.length);
  const iRep = c0.enfants.indexOf(eRep);
  const objetsPris = eRep.brut.map((b, i) => (b ? i : -1)).filter(i => i >= 0);
  const g1 = run.generations[1];
  const pct = x => virg(x * 100, 1) + " %";
  const melange = (bonne, autres) => { const t = [bonne].concat(autres.filter(a => a !== bonne)); return t; };

  const Q = [
    { q: "Population initiale : l'individu #2 a une fitness de " + P0[i2].f + " et la somme des fitness vaut " + rou.somme + ". Quelle est sa probabilité d'être tiré à la roulette ?",
      c: melange(pct(pI2), [pct(P0[i2].f / 100), pct(1 / P0.length), pct(rou.cumuls[i2])]), ok: 0,
      e: "P = " + P0[i2].f + " / " + rou.somme + " = " + pct(pI2) + ". " + pct(rou.cumuls[i2]) + " est son cumul, pas sa probabilité, et 1/6 serait un tirage uniforme sans lien avec la fitness." },
    { q: "Probabilités cumulées : " + rou.cumuls.map(x => virg(x, 3)).join(" ; ") + ". Le tirage vaut " + virg(cpA.r1, 3) + ". Quel parent est choisi ?",
      c: ["#" + (parentDe(cpA.r1) + 1), "#" + parentDe(cpA.r1), "#" + (parentDe(cpA.r1) + 2)], ok: 0,
      e: "On prend le premier individu dont le cumul dépasse strictement le tirage : " + virg(rou.cumuls[parentDe(cpA.r1) - 1], 3) + " ≤ " + virg(cpA.r1, 3) + " < " + virg(rou.cumuls[parentDe(cpA.r1)], 3) + ", donc #" + (parentDe(cpA.r1) + 1) + "." },
    { q: "Couple 1 : le tirage de croisement vaut " + virg(cpA.rc, 3) + " avec pc = 0,8. Que se passe-t-il ?",
      c: cpA.croise ? ["On croise", "Les enfants sont des copies des parents", "On mute tous les gènes"] : ["Les enfants sont des copies des parents", "On croise", "On mute tous les gènes"], ok: 0,
      e: cpA.croise ? "Le tirage est inférieur à 0,8 : on croise." : "Le croisement n'a lieu que si le tirage est strictement inférieur à 0,8. Ici " + virg(cpA.rc, 3) + " ≥ 0,8 : les enfants copient les parents, mais ils passeront quand même par la mutation." },
    { q: "Le tirage du point de coupure vaut " + virg(cpB.rp, 3) + " (7 gènes). Où coupe-t-on ?",
      c: ["Point " + cpB.point + ", après le gène " + L(cpB.point - 1), "Point " + (cpB.point - 1) + ", après le gène " + L(cpB.point - 2), "Point " + Math.round(cpB.rp * 7) + ", après le gène " + L(Math.min(n - 1, Math.round(cpB.rp * 7) - 1))], ok: 0,
      e: "Point = ⌊r × (n − 1)⌋ + 1 = ⌊" + virg(cpB.rp, 3) + " × 6⌋ + 1 = " + Math.floor(cpB.rp * 6) + " + 1 = " + cpB.point + ". La formule donne toujours un point entre 1 et 6, pour que chaque enfant reçoive au moins un gène de chaque parent." },
    { q: "Après mutation, l'enfant " + (iRep + 1) + " vaut " + eRep.brut.join("") + " (objets " + lettres(objetsPris) + "), soit " + eRep.poidsBrut + " kg pour 16 kg autorisés. Quel objet la réparation retire-t-elle en premier ?",
      c: melange(L(eRep.retires[0]), objetsPris.map(L).concat(["C"])).slice(0, 4), ok: 0,
      e: "On retire l'objet pris qui a le plus petit rapport utilité/poids : " + objetsPris.map(i => L(i) + " = " + virg(PB.objets[i].v / PB.objets[i].p, 2)).join(", ") + ". C'est " + L(eRep.retires[0]) + ". Il reste " + eRep.p + " kg, fitness " + eRep.f + ". C n'est pas dans le sac, on ne peut pas le retirer." },
    { q: "Fin du cycle 1 : meilleur parent " + run.generations[0].best + ", meilleur enfant " + g1.best + ". Que fait l'élitisme ?",
      c: c0.elitisme ? ["Le meilleur parent remplace le pire enfant", "Rien", "Il remplace le meilleur enfant"] : ["Rien, l'enfant est déjà meilleur", "Le meilleur parent remplace le pire enfant", "Il remplace le meilleur enfant"], ok: 0,
      e: c0.elitisme ? "Le meilleur parent bat tous les enfants, il prend la place du pire." : "L'élitisme n'agit que si le meilleur parent est strictement meilleur que le meilleur enfant. " + g1.best + " > " + run.generations[0].best + " : on garde les six enfants tels quels." },
    { q: "On règle pm = 0. Dans toute la population, le gène G vaut 0. Que devient G ensuite ?",
      c: ["Il reste à 0 pour toujours", "Le croisement peut le remettre à 1", "La réparation peut le remettre à 1"], ok: 0,
      e: "Le croisement ne fait que recombiner des gènes déjà présents, et la réparation ne fait que retirer des objets. Sans mutation, un 1 disparu ne revient jamais : c'est tout l'intérêt de pm > 0." },
    { q: "L'algorithme s'arrête parce que la stagnation atteint Smax = 10. Qu'est-ce qu'on peut affirmer ?",
      c: ["Le record n'a pas bougé depuis 10 générations", "La solution trouvée est l'optimum", "Toute la population est identique"], ok: 0,
      e: "Le critère dit seulement qu'on ne progresse plus. Un algorithme génétique ne prouve jamais l'optimalité : pour ça, il faut une méthode exacte (énumération, programmation dynamique, branch and bound)." }
  ];

  const reps = Q.map(() => null);
  function rendreQuiz() {
    $("quiz").innerHTML = Q.map((x, i) => '<div class="card qz" id="qz' + i + '"><p class="qz-q"><b>' + (i + 1) + ".</b> " + x.q + '</p><div class="btns">' +
      x.c.map((c, j) => '<button type="button" data-q="' + i + '" data-c="' + j + '"' + (reps[i] !== null ? " disabled" : "") +
        (reps[i] === j ? ' class="' + (j === x.ok ? "bon" : "faux") + '"' : (reps[i] !== null && j === x.ok ? ' class="bon"' : "")) + ">" + c + "</button>").join("") +
      "</div>" + (reps[i] !== null ? '<p class="qz-e">' + (reps[i] === x.ok ? "Exact. " : "Pas tout à fait. ") + x.e + "</p>" : "") + "</div>").join("");
    const faites = reps.filter(r => r !== null).length, bonnes = reps.filter((r, i) => r === Q[i].ok).length;
    $("quizScore").textContent = faites ? "Score : " + bonnes + " / " + faites + (faites === Q.length ? " (quiz terminé)" : "") : "";
    document.querySelectorAll("#quiz button[data-q]").forEach(b => { b.onclick = () => { reps[+b.dataset.q] = +b.dataset.c; rendreQuiz(); }; });
  }
  // Ordre d'affichage des choix mélangé de façon fixe (même ordre pour tout le monde)
  const tirer = AG.creerTirage(REG.graine);
  Q.forEach(x => {
    const idx = x.c.map((_, j) => j);
    for (let j = idx.length - 1; j > 0; j--) { const k = Math.floor(tirer() * (j + 1)); [idx[j], idx[k]] = [idx[k], idx[j]]; }
    x.ok = idx.indexOf(0); x.c = idx.map(j => x.c[j]);
  });
  $("quizReset").onclick = () => { reps.fill(null); rendreQuiz(); };
  rendreQuiz();
  window.__AG_SITE.quiz = Q;
  window.__AG_SITE.anim = () => ({ couple, pas, E });
})();
