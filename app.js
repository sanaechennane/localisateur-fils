// ===========================
// APP.JS - Localisateur de Fils
// ===========================
//
// LOGIQUE PRINCIPALE :
// 1. On charge data.json au démarrage
// 2. Quand l'utilisateur tape → on cherche dans les données
// 3. On utilise filter() (pas find()) pour gérer les doublons
// 4. On affiche TOUS les résultats correspondants

// --- Variables globales ---
let tousLesFils = [];   // Contiendra toutes les données chargées depuis data.json

// --- Correspondance des codes couleur → couleur CSS ---
const couleursCSS = {
  "BE": "#2196f3",   // Bleu
  "NR": "#212121",   // Noir
  "RS": "#e91e63",   // Rose
  "RG": "#f44336",   // Rouge
  "VE": "#4caf50",   // Vert
  "VI": "#9c27b0",   // Violet
  "JN": "#ffeb3b",   // Jaune
  "OR": "#ff9800",   // Orange
  "BG": "#9e9e9e",   // Beige/Gris
  "BA": "#795548",   // Brun
  "GR": "#607d8b",   // Gris
  "MR": "#8b4513",   // Marron
  "VJ": "#00bcd4",   // Vert-Jaune (cyan ici pour lisibilité)
  "BL": "#3f51b5",   // Bleu foncé
  "BN": "#ff5722",   // Brun clair
};

// --- Récupère les éléments HTML dont on a besoin ---
const champRecherche = document.getElementById("champRecherche");
const btnEffacer     = document.getElementById("btnEffacer");
const zoneResultats  = document.getElementById("zoneResultats");
const compteur       = document.getElementById("compteur");

// ===========================
// ÉTAPE 1 : Chargement des données
// ===========================
async function chargerDonnees() {
  try {
    const reponse = await fetch("data.json");
    tousLesFils = await reponse.json();
    afficherEtatVide(); // Afficher l'écran d'accueil
  } catch (erreur) {
    zoneResultats.innerHTML = `
      <div class="message-etat">
        <span class="grande-icone">⚠️</span>
        <p>Impossible de charger les données.</p>
        <p class="hint">Vérifiez que le fichier data.json est présent.</p>
      </div>
    `;
    console.error("Erreur de chargement:", erreur);
  }
}

// ===========================
// ÉTAPE 2 : Recherche (au cœur de l'application)
// ===========================
function rechercherFils(texte) {
  // On nettoie le texte : suppression des espaces, majuscules
  const recherche = texte.trim().toUpperCase();

  // Si le champ est vide → afficher l'écran d'accueil
  if (recherche === "") {
    btnEffacer.style.display = "none";
    afficherEtatVide();
    compteur.textContent = "";
    return;
  }

  // Montrer le bouton effacer
  btnEffacer.style.display = "block";

  // --- RECHERCHE PAR TORSADE ---
  // On vérifie d'abord si le texte correspond à une torsade
  // filter() renvoie TOUS les fils qui ont cette torsade
  const resultatsParTorsade = tousLesFils.filter(function(fil) {
    return fil.torsade !== "" && fil.torsade.toUpperCase() === recherche;
  });

  // --- RECHERCHE PAR CODE FIL ---
  // filter() renvoie TOUTES les occurrences de ce codeFil
  const resultatsParCode = tousLesFils.filter(function(fil) {
    return fil.codeFil.toUpperCase() === recherche;
  });

  // --- On décide quoi afficher ---
  if (resultatsParTorsade.length > 0) {
    // L'utilisateur a tapé un code de torsade → afficher tous ses fils
    afficherResultatsTorsade(resultatsParTorsade, recherche);

  } else if (resultatsParCode.length > 0) {
    // L'utilisateur a tapé un codeFil → afficher toutes ses occurrences
    afficherResultatsFils(resultatsParCode);

  } else {
    // Rien trouvé
    afficherRienTrouve(texte.trim());
  }
}

// ===========================
// ÉTAPE 3 : Affichage des résultats
// ===========================

// --- Affichage pour une torsade (tous les fils de cette torsade) ---
function afficherResultatsTorsade(resultats, codeTorsade) {
  let html = "";

  // Titre du groupe
  html += `
    <div class="titre-groupe">
      <span class="icone-groupe">🔗</span>
      <span>Torsade ${codeTorsade} — ${resultats.length} fil(s)</span>
    </div>
  `;

  // Une carte par fil
  resultats.forEach(function(fil) {
    html += creerCarte(fil);
  });

  zoneResultats.innerHTML = html;
  compteur.textContent = `${resultats.length} résultat(s) trouvé(s)`;
}

// --- Affichage pour un codeFil (peut avoir plusieurs occurrences) ---
function afficherResultatsFils(resultats) {
  let html = "";

  // Si plusieurs résultats, afficher un titre
  if (resultats.length > 1) {
    html += `
      <div class="titre-groupe">
        <span class="icone-groupe">📋</span>
        <span>${resultats.length} occurrences trouvées pour ce code</span>
      </div>
    `;
  }

  // Une carte par résultat
  resultats.forEach(function(fil) {
    html += creerCarte(fil);
  });

  zoneResultats.innerHTML = html;
  compteur.textContent = `${resultats.length} résultat(s) trouvé(s)`;
}

// --- Crée le HTML d'une carte pour un fil ---
function creerCarte(fil) {
  // Gérer les valeurs vides
  const torsadeTexte   = fil.torsade    || "—";
  const familleTexte   = fil.famille    || "—";
  const couleurTexte   = fil.couleur    || "—";
  const rackTexte      = fil.rack       || "—";
  const emplacementTexte = fil.emplacement || "—";

  // Badge torsade (affiché seulement si le fil a une torsade)
  const badgeTorsade = fil.torsade
    ? `<span class="badge-torsade">🔗 ${fil.torsade}</span>`
    : "";

  // Pastille de couleur
  const codesCouleursBase = couleurTexte.split("/").map(c => c.trim());
  const couleurCSSPrincipale = couleursCSS[codesCouleursBase[0]] || "#607d8b";

  const pastille = `
    <span class="pastille-couleur">
      <span class="rond-couleur" style="background-color: ${couleurCSSPrincipale};"></span>
      ${couleurTexte}
    </span>
  `;

  return `
    <div class="carte">
      <div class="carte-entete">
        <span class="code-fil">📦 ${fil.codeFil}</span>
        ${badgeTorsade}
      </div>
      <div class="carte-infos">
        <div class="info-bloc">
          <span class="info-label">Rack</span>
          <span class="info-valeur rack-valeur">${rackTexte}</span>
        </div>
        <div class="info-bloc">
          <span class="info-label">Emplacement</span>
          <span class="info-valeur emplacement-valeur">${emplacementTexte}</span>
        </div>
        <div class="info-bloc">
          <span class="info-label">Famille</span>
          <span class="info-valeur">${familleTexte}</span>
        </div>
        <div class="info-bloc">
          <span class="info-label">Couleur</span>
          <span class="info-valeur">${pastille}</span>
        </div>
      </div>
    </div>
  `;
}

// --- Affichage : rien trouvé ---
function afficherRienTrouve(texte) {
  zoneResultats.innerHTML = `
    <div class="message-etat">
      <span class="grande-icone">🔍</span>
      <p>Aucun résultat pour <strong>"${texte}"</strong></p>
      <p class="hint">Vérifiez l'orthographe du code fil ou de la torsade.</p>
    </div>
  `;
  compteur.textContent = "0 résultat trouvé";
}

// --- Affichage : écran d'accueil (champ vide) ---
function afficherEtatVide() {
  zoneResultats.innerHTML = `
    <div class="message-etat">
      <span class="grande-icone">🏭</span>
      <p>Tapez un <strong>code fil</strong> ou une <strong>torsade</strong></p>
      <p class="hint">Exemple : 2801 &nbsp;|&nbsp; TPB1A</p>
    </div>
  `;
}

// ===========================
// ÉTAPE 4 : Événements (écouter l'utilisateur)
// ===========================

// Écouter la frappe dans le champ de recherche
champRecherche.addEventListener("input", function() {
  rechercherFils(champRecherche.value);
});

// Bouton effacer → vider le champ et réinitialiser
btnEffacer.addEventListener("click", function() {
  champRecherche.value = "";
  btnEffacer.style.display = "none";
  afficherEtatVide();
  compteur.textContent = "";
  champRecherche.focus();
});

// ===========================
// DÉMARRAGE : charger les données au chargement de la page
// ===========================
chargerDonnees();
