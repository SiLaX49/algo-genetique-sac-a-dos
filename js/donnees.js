/* Données et réglages officiels : fil rouge et exercice complémentaire. */
(function (root) {
  "use strict";
  const REGLAGES = { N: 6, pc: 0.8, pm: 0.1, Gmax: 30, Smax: 10, graine: 1814 };
  const FIL_ROUGE = { C: 16, objets: [
    { id: "A", nom: "Trousse médicale", p: 5, v: 14 },
    { id: "B", nom: "Radio", p: 3, v: 7 },
    { id: "C", nom: "Couverture chauffante", p: 2, v: 3 },
    { id: "D", nom: "Réserve d'eau", p: 6, v: 15 },
    { id: "E", nom: "Balise GPS", p: 1, v: 3 },
    { id: "F", nom: "Corde", p: 4, v: 6 },
    { id: "G", nom: "Bouteille d'oxygène", p: 7, v: 16 }
  ] };
  const EXERCICE = { C: 10, objets: [
    { id: "A", nom: "Testeur de câbles", p: 4, v: 9 },
    { id: "B", nom: "Switch de secours", p: 3, v: 7 },
    { id: "C", nom: "Baie portable", p: 5, v: 10 },
    { id: "D", nom: "Outils de sertissage", p: 2, v: 3 },
    { id: "E", nom: "Onduleur", p: 6, v: 12 }
  ] };
  const REGLAGES_EXERCICE = { N: 4, pc: 0.8, pm: 0.1, Gmax: 1, Smax: 10, graine: 8414 };
  const D = { REGLAGES, REGLAGES_EXERCICE, FIL_ROUGE, EXERCICE };
  if (typeof module !== "undefined" && module.exports) module.exports = D;
  else root.DONNEES = D;
})(this);
