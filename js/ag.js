/* Moteur de l'algorithme génétique du cours (sujet 7).
   Le même fichier sert au site (navigateur) et aux scripts de vérification (Node).
   Tirages à 3 décimales : on peut refaire chaque comparaison à la main. */
(function (root) {
  "use strict";

  // Générateur pseudo-aléatoire mulberry32, ramené à 3 décimales dans [0 ; 0,999]
  function creerTirage(graine) {
    let a = graine | 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      const x = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      return Math.floor(x * 1000) / 1000;
    };
  }

  // Ordre de réparation : plus petit rapport valeur/poids d'abord, indice en cas d'égalité
  function ordreReparation(objets) {
    return objets.map((_, i) => i).sort((i, j) => {
      const d = objets[i].v * objets[j].p - objets[j].v * objets[i].p;
      return d !== 0 ? d : i - j;
    });
  }

  function poidsValeur(g, objets) {
    let p = 0, v = 0;
    g.forEach((b, i) => { if (b) { p += objets[i].p; v += objets[i].v; } });
    return { p, v };
  }

  // Évaluation : réparation si le sac déborde, puis fitness = valeur totale
  function evaluer(brut, pb) {
    const g = brut.slice();
    const avant = poidsValeur(g, pb.objets);
    let p = avant.p;
    const retires = [];
    if (p > pb.C) {
      for (const i of ordreReparation(pb.objets)) {
        if (g[i]) {
          g[i] = 0; p -= pb.objets[i].p; retires.push(i);
          if (p <= pb.C) break;
        }
      }
    }
    const apres = poidsValeur(g, pb.objets);
    return { brut: brut.slice(), poidsBrut: avant.p, retires, g, p: apres.p, f: apres.v };
  }

  // Roulette : premier individu dont la probabilité cumulée dépasse strictement le tirage
  function roulette(pop) {
    const somme = pop.reduce((s, x) => s + x.f, 0);
    let c = 0;
    const probas = pop.map(x => x.f / (somme || 1));
    const cumuls = probas.map(q => (c += q));
    return { somme, probas, cumuls };
  }
  function choisir(cumuls, r) {
    for (let i = 0; i < cumuls.length; i++) if (r < cumuls[i]) return i;
    return cumuls.length - 1;
  }

  function initialiser(pb, cfg, tirer) {
    const pop = [], tirages = [];
    for (let k = 0; k < cfg.N; k++) {
      const brut = [], ligne = [];
      for (let i = 0; i < pb.objets.length; i++) {
        const r = tirer(); ligne.push(r); brut.push(r < 0.5 ? 1 : 0);
      }
      tirages.push(ligne);
      pop.push(evaluer(brut, pb));
    }
    return { pop, tirages };
  }

  // Un cycle complet : sélection, croisement, mutation, réparation, élitisme
  function cycle(pop, pb, cfg, tirer) {
    const n = pb.objets.length;
    const rou = roulette(pop);
    const couples = [];
    let enfants = [];
    for (let k = 0; k < cfg.N / 2; k++) {
      const r1 = tirer(), r2 = tirer();
      const i1 = choisir(rou.cumuls, r1), i2 = choisir(rou.cumuls, r2);
      const rc = tirer();
      const croise = rc < cfg.pc;
      let rp = null, point = null;
      let e1 = pop[i1].g.slice(), e2 = pop[i2].g.slice();
      if (croise) {
        rp = tirer();
        point = Math.floor(rp * (n - 1)) + 1;
        const a = pop[i1].g, b = pop[i2].g;
        e1 = a.slice(0, point).concat(b.slice(point));
        e2 = b.slice(0, point).concat(a.slice(point));
      }
      couples.push({ r1, r2, i1, i2, rc, croise, rp, point, e1: e1.slice(), e2: e2.slice() });
      for (const av of [e1, e2]) {
        const tm = [], ap = av.slice(), muts = [];
        for (let i = 0; i < n; i++) {
          const r = tirer(); tm.push(r);
          if (r < cfg.pm) { ap[i] ^= 1; muts.push(i); }
        }
        enfants.push(Object.assign(evaluer(ap, pb), { avantMut: av.slice(), tm, muts, couple: k }));
      }
    }
    // Élitisme : le meilleur parent remplace le pire enfant s'il bat le meilleur enfant
    let meilleurParent = 0;
    pop.forEach((x, i) => { if (x.f > pop[meilleurParent].f) meilleurParent = i; });
    const maxE = Math.max(...enfants.map(x => x.f));
    let elitisme = null;
    if (pop[meilleurParent].f > maxE) {
      let pire = 0;
      enfants.forEach((x, i) => { if (x.f < enfants[pire].f) pire = i; });
      elitisme = { parent: meilleurParent, remplace: pire };
    }
    const suivante = enfants.map(x => ({ brut: x.brut, poidsBrut: x.poidsBrut, retires: x.retires, g: x.g, p: x.p, f: x.f }));
    if (elitisme) {
      const m = pop[meilleurParent];
      suivante[elitisme.remplace] = { brut: m.g.slice(), poidsBrut: m.p, retires: [], g: m.g.slice(), p: m.p, f: m.f };
    }
    return { roulette: rou, couples, enfants, elitisme, suivante };
  }

  // Exécution complète avec le test de boucle du cours
  function executer(pb, cfg) {
    const tirer = creerTirage(cfg.graine);
    const init = initialiser(pb, cfg, tirer);
    let pop = init.pop;
    const meilleurDe = P => P.reduce((m, x) => (x.f > m.f ? x : m), P[0]);
    const m0 = meilleurDe(pop);
    let meilleur = { g: m0.g.slice(), p: m0.p, f: m0.f, generation: 0 };
    const stat = P => ({ best: meilleurDe(P).f, moyenne: P.reduce((s, x) => s + x.f, 0) / P.length });
    const generations = [{ t: 0, pop, stagnation: 0, ...stat(pop) }];
    const cycles = [];
    let t = 0, stagnation = 0, arret = null;
    while (true) {
      if (t >= cfg.Gmax) { arret = "Gmax"; break; }
      if (stagnation >= cfg.Smax) { arret = "stagnation"; break; }
      const c = cycle(pop, pb, cfg, tirer);
      cycles.push(c);
      pop = c.suivante; t++;
      const mb = meilleurDe(pop);
      if (mb.f > meilleur.f) {
        meilleur = { g: mb.g.slice(), p: mb.p, f: mb.f, generation: t };
        stagnation = 0;
      } else stagnation++;
      generations.push({ t, pop, stagnation, ...stat(pop) });
    }
    return { tiragesInit: init.tirages, generations, cycles, meilleur, arret };
  }

  // Référence : énumération exhaustive (n petit) et glouton par rapport v/p décroissant
  function exact(pb) {
    const n = pb.objets.length;
    let best = { f: -1 }, ok = 0, nbOpt = 0;
    for (let m = 0; m < (1 << n); m++) {
      const g = []; for (let i = 0; i < n; i++) g.push((m >> (n - 1 - i)) & 1);
      const { p, v } = poidsValeur(g, pb.objets);
      if (p <= pb.C) {
        ok++;
        if (v > best.f) { best = { g, p, f: v }; nbOpt = 1; } else if (v === best.f) nbOpt++;
      }
    }
    return { ...best, realisables: ok, total: 1 << n, nbOptima: nbOpt };
  }
  function glouton(pb) {
    const ordre = ordreReparation(pb.objets).reverse();
    const g = pb.objets.map(() => 0);
    let p = 0;
    // l'ordre décroissant est recalculé pour garder l'indice le plus petit en cas d'égalité
    const dec = pb.objets.map((_, i) => i).sort((i, j) => {
      const d = pb.objets[j].v * pb.objets[i].p - pb.objets[i].v * pb.objets[j].p;
      return d !== 0 ? d : i - j;
    });
    for (const i of dec) if (p + pb.objets[i].p <= pb.C) { g[i] = 1; p += pb.objets[i].p; }
    return { g, p, f: poidsValeur(g, pb.objets).v, ordre: dec };
  }

  const AG = { creerTirage, ordreReparation, poidsValeur, evaluer, roulette, choisir, cycle, executer, exact, glouton };
  if (typeof module !== "undefined" && module.exports) module.exports = AG;
  else root.AG = AG;
})(this);
