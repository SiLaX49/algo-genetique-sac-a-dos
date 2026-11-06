# Journal du sujet 7

## 06/11/2026 : semaine ISO 45, humaniser : non (semaine impaire)

**Site**
- Nouvelle page `index.html` : cours complet, phases avec choix et alternatives, cycle à la main, bilan, exercice avec correction, références.
- Simulateur du fil rouge à graine fixe (1814), génération par génération, avec courbe et comparaison au glouton et à l'optimum.
- L'ancien simulateur devient `labo.html`, avec roulette ajoutée et réglages par défaut alignés sur le cours (roulette, 1 point, pc = 0,8, élitisme 1, réparation). Sa mutation par défaut reste à 2 % par gène car l'instance a 40 objets, et ses nombres ne sont pas arrondis à 3 décimales.

**Word**
- Première version : `cours-word/sujet7_cours_v2026-11-06.docx`, 5 pages de cours + 2 pages d'annexe (rendu LibreOffice, à recontrôler dans Word).

**Données fixées**
- Fil rouge : drone de secours, C = 16, 7 objets, N = 6, pc = 0,8, pm = 0,10, Gmax = 30, Smax = 10, graine 1814. Résultat : 40 à la génération 7, arrêt à t = 17. Glouton 39, optimum 40.
- Exercice : mallette réseau, C = 10, 5 objets, N = 4, graine 8414, un cycle. Meilleur 20, glouton 19, optimum 21.

**Vérification**
- Moteur JS, recalcul Python indépendant, simulateur (Playwright, aucune erreur JS, pas de débordement à 390 px) et contenu du Word : concordants. Aucune erreur restante.
- Outil en ligne : 40, objets 1, 2, 5, 7 (capture du 06/11/2026). Il utilise la programmation dynamique, pas un algorithme génétique.
- 620 graines sur 1000 (1 à 1000) atteignent 40.

**Blocages à la date de cette entrée**
- Push refusé : le dépôt n'est pas autorisé en écriture pour la tâche planifiée, et l'outil add_repo n'était pas disponible.
- `https://silax49.github.io/algo-genetique-sac-a-dos/` répondait 404 : vérifier que Pages est activé.

**À valider par le groupe ou le prof**
- Choix : réparation plutôt que pénalité, N = 6, pm = 0,10 au lieu de 1/n.
- Outil en ligne exact accepté alors que le sujet porte sur un algorithme génétique ?
- Noms du groupe à compléter dans le Word. Fiche de déclaration d'usage de l'IA à joindre au dépôt Moodle.
- Références (Holland, Goldberg, Kellerer et al.) citées de mémoire, à contrôler avant dépôt.

**Pour la suite** : quiz, animation du croisement, mini-défi « bats l'algo », fiche mémo, page pièges. Semaine paire : passe humaniser.
