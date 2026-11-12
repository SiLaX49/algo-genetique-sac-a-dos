// Test du site : aucune erreur JS, simulateur identique à verification/resultats.json.
// Usage : servir le dépôt sur localhost:8123 puis node verification/test_site.js [dossier_captures]
const { chromium } = require("playwright");
const R = require("./resultats.json");
(async () => {
  const b = await chromium.launch(); let err = 0;
  const check = (c, m) => { if (!c) { err++; console.log("ERREUR", m); } };
  const p = await b.newPage({ viewport: { width: 1200, height: 900 } });
  p.on("pageerror", e => check(false, "JS " + e.message));
  p.on("console", m => { if (m.type() === "error") check(false, "console " + m.text()); });
  await p.goto("http://localhost:8123/index.html", { waitUntil: "load" });
  const J = R.filRouge.run;
  await p.click("#bFil");
  for (let t = 0; t < J.generations.length; t++) {
    const lignes = await p.$$eval("#tPop tbody tr", tr => tr.map(l => [...l.children].map(c => c.innerText.replace(/\s/g, ""))));
    J.generations[t].pop.forEach((x, i) => check(lignes[i][1] === x.g.join("") && +lignes[i][3] === x.f && +lignes[i][2] === x.p, "gén " + t + " ind " + i));
    if (t < J.generations.length - 1) await p.click("#bSuiv");
  }
  check((await p.innerText("#vArret")).includes("40 points"), "arrêt");
  // Animation : la dernière étape de chaque couple doit afficher les enfants finaux du cycle 1
  const C1 = J.generations[1].pop;
  for (let k = 0; k < 3; k++) {
    await p.click("#anCouples button:nth-child(" + (k + 1) + ")");
    while (!(await p.$eval("#anSuiv", b => b.disabled))) await p.click("#anSuiv");
    const txt = (await p.innerText("#anVue")).replace(/\s/g, "");
    const att = await p.evaluate(k => window.__AG_SITE.run.cycles[0].enfants.slice(2 * k, 2 * k + 2).map(x => x.g.join("") + x.p + "kg,fitness" + x.f), k);
    att.forEach(a => check(txt.includes(a), "animation couple " + (k + 1) + " : " + a));
  }
  check(C1.length === 6, "génération 1 présente");
  // Quiz : 8 questions, cliquer la bonne réponse partout donne 8 / 8
  const nQ = await p.evaluate(() => window.__AG_SITE.quiz.length);
  check(nQ === 8, "quiz à 8 questions");
  for (let i = 0; i < nQ; i++) {
    const ok = await p.evaluate(i => window.__AG_SITE.quiz[i].ok, i);
    await p.click('#quiz button[data-q="' + i + '"][data-c="' + ok + '"]');
  }
  check((await p.innerText("#quizScore")).includes("8 / 8"), "score du quiz");
  const q1 = await p.innerText("#qz0");
  check(q1.includes("34 / 146 = 23,3 %"), "correction question 1");
  // Défi : A + B + E + G = 16 kg et 40 points (optimum) ; ajouter D fait déborder
  for (const i of [0, 1, 4, 6]) await p.click('#dfObjets .df-o[data-i="' + i + '"]');
  check((await p.innerText("#dfVal")) === "40 pts" && (await p.innerText("#dfPoids")) === "16 / 16 kg", "défi : optimum 40 pts, 16 kg");
  check((await p.innerText("#dfMsg")).includes("l'optimum"), "défi : message optimum");
  check((await p.innerText("#dfChrom")).replace(/\s/g, "") === "1100101", "défi : chromosome");
  await p.click('#dfObjets .df-o[data-i="3"]');
  check((await p.innerText("#dfMsg")).startsWith("Trop lourd de 6 kg"), "défi : surcharge");
  await p.click("#dfVider");
  check((await p.innerText("#dfVal")) === "0 pts", "défi : vider");
  await p.goto("http://localhost:8123/labo.html", { waitUntil: "load" });
  await p.click("#btnStep");
  for (const [w, u] of [[390, "index.html"], [390, "labo.html"]]) {
    const m = await b.newPage({ viewport: { width: w, height: 800 } });
    m.on("pageerror", e => check(false, "JS mobile " + e.message));
    await m.goto("http://localhost:8123/" + u, { waitUntil: "load" });
    const d = await m.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    check(d <= 0, u + " déborde de " + d + " px en mobile");
    if (process.argv[2] && u === "index.html") await m.screenshot({ path: process.argv[2] + "/mobile.png", fullPage: true });
  }
  if (process.argv[2]) {
    const c = await b.newPage({ viewport: { width: 1000, height: 800 }, deviceScaleFactor: 1 });
    await c.goto("http://localhost:8123/index.html", { waitUntil: "load" });
    for (let i = 0; i < 7; i++) await c.click("#bSuiv");
    await (await c.$("#simulateur .card")).screenshot({ path: process.argv[2] + "/simu.png" });
    await c.screenshot({ path: process.argv[2] + "/haut.png" });
    await (await c.$("#cycle")).screenshot({ path: process.argv[2] + "/cycle.png" });
  }
  await b.close(); console.log("Test site", err ? "KO (" + err + ")" : "OK"); process.exit(err ? 1 : 0);
})();
