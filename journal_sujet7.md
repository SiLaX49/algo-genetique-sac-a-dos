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

## 06/11/2026 (second passage, test de la tâche planifiée) : semaine ISO 45, humaniser : non (semaine impaire)

**Contexte** : la PR de la semaine 45 (SiLaX49/algo-genetique-sac-a-dos#1) est fusionnée et le site est en ligne. Ce passage sert aussi à tester la nouvelle tâche planifiée du jeudi 11h45, qui travaille sur une branche et ouvre une PR.

**Site**
- Nouvelle section « Croisement et mutation au ralenti » (`#animation`) : on rejoue un couple du cycle 1, au choix, en 4 ou 5 étapes (parents, test de croisement, échange des queues, mutation, réparation). Un trait coloré sous chaque gène montre son parent d'origine.
- Nouvelle section « Quiz » (`#auto-eval`) : 8 questions avec correction rédigée (probabilité de roulette, choix d'un parent, test pc, point de coupure, réparation, élitisme, rôle de la mutation, sens du critère d'arrêt). Les chiffres viennent du moteur, rien n'est écrit en dur.
- Code dans `js/interactif.js`, liens ajoutés au sommaire.

**Word** : pas de nouvelle version. La v2026-11-06 date d'aujourd'hui, et une nouvelle version porterait le même nom. Les deux ajouts sont propres au site.

**Vérification**
- `verifier.py`, `verifier_docx.py` : OK, données inchangées.
- `test_site.js` étendu : pour chacun des 3 couples, la dernière étape de l'animation affiche les enfants finaux du moteur ; le quiz a 8 questions, 8 / 8 avec les bonnes réponses, correction de la question 1 = 34 / 146 = 23,3 %. Aucune erreur JavaScript, pas de débordement à 390 px.
- Aucune erreur trouvée dans les calculs.

**À valider par le groupe ou le prof** : les points de l'entrée précédente restent ouverts (choix N = 6 et pm = 0,10, outil en ligne exact, références citées de mémoire, noms du groupe, fiche IA).

**Pour la suite** : mini-défi « bats l'algo », fiche mémo imprimable, page pièges fréquents. Prochain passage le 12/11 (semaine 46, paire) : humaniser.

## 12/11/2026 : semaine ISO 46, humaniser : oui (semaine paire)

**Site**
- Nouvelle section « Défi » (`#defi`, `js/defi.js`) : on compose son chargement objet par objet, le chromosome, le poids et l'utilité se mettent à jour, et un message compare au glouton (39), à l'algorithme génétique du fil rouge (40) et à l'optimum. Les références sont calculées par le moteur.
- Passe humaniser sur le texte visible rédigé en HTML : accroche, problème, introduction des phases, note sur l'arrêt, animation, bilan, outil en ligne, quiz. Les textes produits par le JavaScript (corrections du quiz, phrases du cycle) n'ont pas été touchés, comme le demande la consigne.

**Word** : nouvelle version `cours-word/sujet7_cours_v2026-11-12.docx` (la v2026-11-06 est conservée).
- Humaniser sur le texte : objectif du chapitre, raison du critère d'arrêt, outil en ligne (suppression des tournures « pas A, mais B »).
- Ajout chiffré : sur les graines 1 à 1000, N = 10 atteint 40 dans 763 cas et N = 20 dans 940 cas (contre 620 pour N = 6). La phrase « augmenter N améliore ce taux » n'avait pas de chiffre.
- Ajout d'un paragraphe sur les outils interactifs du site (animation, quiz, défi).
- 7 pages sous LibreOffice : 5 de cours, 2 d'annexe.

**Vérification**
- `verifier.py`, `verifier_docx.py` sur les deux versions du Word : OK.
- `test_site.js` étendu au défi (A + B + E + G = 16 kg et 40 points reconnu comme optimum, surcharge de 6 kg détectée en ajoutant D, bouton vider). Aucune erreur JavaScript, pas de débordement à 390 px.
- Taux de réussite par taille de population recalculés par script (moteur `js/ag.js`).
- Aucune erreur trouvée dans les calculs.

**À valider par le groupe ou le prof** : toujours ouverts (choix N = 6 et pm = 0,10, outil en ligne exact, références citées de mémoire, noms du groupe, fiche IA). Le style du Word (titres en couleur, gras) n'a pas été changé : à décider si on veut un rendu plus sobre.

**Pour la suite** : fiche mémo imprimable, page pièges fréquents sur le site. Prochain passage le 19/11 (semaine 47, impaire) : travail de fond.
