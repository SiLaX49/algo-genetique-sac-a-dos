// Produit verification/resultats.json à partir du moteur utilisé par le site.
const fs = require("fs"), path = require("path");
const AG = require("../js/ag.js"), D = require("../js/donnees.js");
const res = {
  filRouge: { pb: D.FIL_ROUGE, cfg: D.REGLAGES, run: AG.executer(D.FIL_ROUGE, D.REGLAGES), exact: AG.exact(D.FIL_ROUGE), glouton: AG.glouton(D.FIL_ROUGE), ordreRep: AG.ordreReparation(D.FIL_ROUGE.objets) },
  exercice: { pb: D.EXERCICE, cfg: D.REGLAGES_EXERCICE, run: AG.executer(D.EXERCICE, D.REGLAGES_EXERCICE), exact: AG.exact(D.EXERCICE), glouton: AG.glouton(D.EXERCICE), ordreRep: AG.ordreReparation(D.EXERCICE.objets) }
};
fs.writeFileSync(path.join(__dirname, "resultats.json"), JSON.stringify(res));
