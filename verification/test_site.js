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
