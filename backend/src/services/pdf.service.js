/**
 * pdf.service.js
 * Service de génération PDF pour EtuDocs
 * Placé dans : backend/src/services/pdf.service.js
 *
 * Appelé depuis demande.service.js :
 *   pdfService.generateDocument(demande, etudiant, null, reference, institution, qrData)
 */

const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
const QRCode = require("qrcode");

// ─────────────────────────────────────────────
// CHEMINS
// ─────────────────────────────────────────────

const ASSETS_DIR = path.resolve(__dirname, "../assets");
const OUTPUT_DIR = path.resolve(process.cwd(), "uploads", "pdfs");

// Crée le dossier de sortie si inexistant
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// ─────────────────────────────────────────────
// UTILITAIRES ASSETS
// ─────────────────────────────────────────────

/**
 * Convertit une image (chemin local) en base64 data URL pour l'embarquer dans le HTML.
 * Supporte aussi les URLs distantes (retournées telles quelles).
 */
function imageToBase64(filePath) {
  try {
    if (!filePath) return null;
    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
      return filePath; // URL distante → on la passe directement à Puppeteer
    }
    const abs = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(abs)) return null;
    const ext = path.extname(abs).toLowerCase().replace(".", "");
    const mime = ext === "jpg" ? "jpeg" : ext;
    const data = fs.readFileSync(abs).toString("base64");
    return `data:image/${mime};base64,${data}`;
  } catch {
    return null;
  }
}

/**
 * Retourne le logo d'une institution par son sigle.
 * Si l'institution a un logoUrl enregistré en BD, on l'utilise.
 * Sinon on cherche dans assets/logos/<SIGLE>.png
 */
function getLogoInstitution(institution) {
  if (institution?.logoUrl) return imageToBase64(institution.logoUrl);
  const sigle = (institution?.sigle || "IFRI").toUpperCase();
  const localPath = path.join(ASSETS_DIR, "logos", `${sigle}.png`);
  return imageToBase64(localPath);
}

/** Logo UAC (fixe) */
function getLogoUAC() {
  return imageToBase64(path.join(ASSETS_DIR, "logos", "UAC.png"));
}

/** Tampon Directeur Adjoint */
function getTamponDA(institution) {
  if (institution?.tamponDirecteurAdjointUrl)
    return imageToBase64(institution.tamponDirecteurAdjointUrl);
  return imageToBase64(path.join(ASSETS_DIR, "stamps", "DA.png"));
}

/** Tampon Directeur */
function getTamponDIR(institution) {
  if (institution?.tamponDirecteurUrl)
    return imageToBase64(institution.tamponDirecteurUrl);
  return imageToBase64(path.join(ASSETS_DIR, "stamps", "DIR.png"));
}

// ─────────────────────────────────────────────
// GÉNÉRATION QR CODE
// ─────────────────────────────────────────────

async function generateQRDataURL(text) {
  try {
    return await QRCode.toDataURL(text, {
      width: 80,
      margin: 1,
      color: { dark: "#000000", light: "#ffffff" },
    });
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────
// STRUCTURE DES UE PAR SEMESTRE (données fixes IFRI/SE-IoT)
// À remplacer par un import BD quand le modèle UE/NoteUE sera en place
// ─────────────────────────────────────────────

const UE_STRUCTURES = {
  1: [
    {
      code: "MTH1121",
      intitule: "LOGIQUE, ARITHMÉTIQUE ET SES APPLICATIONS",
      credits: 5,
      ecus: [
        { code: "1MTH1121", intitule: "Logique, arithmétique et applications" },
      ],
    },
    {
      code: "MTH1122",
      intitule: "MATHÉMATIQUES FONDAMENTALES",
      credits: 5,
      ecus: [
        { code: "1MTH1122", intitule: "Algèbre linéaire et applications" },
        { code: "2MTH1122", intitule: "Analyse et applications" },
      ],
    },
    {
      code: "MTH1123",
      intitule: "PROBABILITÉ ET STATISTIQUE",
      credits: 5,
      ecus: [
        {
          code: "1MTH1123",
          intitule: "Analyse combinatoire, calcul des probabilités et applications",
        },
        {
          code: "2MTH1123",
          intitule: "Statistiques inférentielles et applications",
        },
      ],
    },
    {
      code: "INF1124",
      intitule: "ARCHITECTURE ET TOPOLOGIE DES RÉSEAUX INFORMATIQUES",
      credits: 4,
      ecus: [
        {
          code: "1INF1124",
          intitule: "Architecture et topologie des réseaux informatiques",
        },
      ],
    },
    {
      code: "INF1125",
      intitule: "SYSTÈME D'EXPLOITATION ET OUTILS DE BASE EN INFORMATIQUE",
      credits: 4,
      ecus: [
        {
          code: "1INF1125",
          intitule: "Utilisation et administration sous Windows/Linux",
        },
        { code: "2INF1125", intitule: "Outils de base en informatique" },
      ],
    },
    {
      code: "INF1126",
      intitule: "BASE DE LA PROGRAMMATION",
      credits: 4,
      ecus: [
        { code: "1INF1126", intitule: "Algorithmique" },
        { code: "2INF1126", intitule: "Langages C" },
      ],
    },
    {
      code: "DRP1127",
      intitule: "DÉONTOLOGIE ET DROIT LIÉS AUX TIC",
      credits: 2,
      ecus: [
        { code: "1DRP1127", intitule: "Déontologie et droit liés aux TIC" },
      ],
    },
    {
      code: "TCC1128",
      intitule: "TECHNIQUES D'EXPRESSION ÉCRITE ET ORALE",
      credits: 1,
      ecus: [
        {
          code: "1TCC1128",
          intitule: "Techniques d'expression écrite et orale",
        },
      ],
    },
  ],
  2: [
    {
      code: "MTH1221",
      intitule: "ALGÈBRE LINÉAIRE AVANCÉE",
      credits: 5,
      ecus: [
        { code: "1MTH1221", intitule: "Espaces vectoriels et applications linéaires" },
        { code: "2MTH1221", intitule: "Matrices et déterminants" },
      ],
    },
    {
      code: "INF1222",
      intitule: "PROGRAMMATION ORIENTÉE OBJET",
      credits: 5,
      ecus: [
        { code: "1INF1222", intitule: "Concepts POO et Java" },
        { code: "2INF1222", intitule: "Structures de données et algorithmes avancés" },
      ],
    },
    {
      code: "INF1223",
      intitule: "BASE DE DONNÉES",
      credits: 4,
      ecus: [
        { code: "1INF1223", intitule: "Modélisation et conception de BDD" },
        { code: "2INF1223", intitule: "SQL et administration" },
      ],
    },
    {
      code: "INF1224",
      intitule: "SYSTÈMES D'INFORMATION",
      credits: 4,
      ecus: [
        { code: "1INF1224", intitule: "Analyse et conception des SI" },
        { code: "2INF1224", intitule: "UML et méthodes agiles" },
      ],
    },
    {
      code: "INF1225",
      intitule: "RÉSEAUX INFORMATIQUES",
      credits: 4,
      ecus: [
        { code: "1INF1225", intitule: "Protocoles réseau TCP/IP" },
        { code: "2INF1225", intitule: "Administration réseau" },
      ],
    },
    {
      code: "DRP1226",
      intitule: "DROIT DU NUMÉRIQUE",
      credits: 2,
      ecus: [
        { code: "1DRP1226", intitule: "Cybercriminalité et protection des données" },
      ],
    },
    {
      code: "TCC1227",
      intitule: "COMMUNICATION PROFESSIONNELLE",
      credits: 1,
      ecus: [
        { code: "1TCC1227", intitule: "Rédaction professionnelle et présentation orale" },
      ],
    },
  ],
};

// ─────────────────────────────────────────────
// GÉNÉRATION DES NOTES ALÉATOIRES
// ─────────────────────────────────────────────

/** Note aléatoire entre min et max (1 décimale) */
function randNote(min = 8, max = 19) {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

/**
 * Calcule la cote LMD à partir d'une note /20
 */
function getCote(note) {
  if (note >= 16) return "A+";
  if (note >= 15) return "A";
  if (note >= 14) return "A−";
  if (note >= 13) return "B+";
  if (note >= 12) return "B−";
  if (note >= 11) return "C+";
  if (note >= 10) return "C";
  if (note >= 9)  return "C−";
  if (note >= 8)  return "D+";
  if (note >= 5)  return "D";
  return "F";
}

/**
 * Génère les notes aléatoires pour un semestre donné.
 * Chaque UE a une moyenne pondérée calculée depuis ses ECU.
 * Retourne aussi la moyenne semestrielle et les crédits capitalisés.
 */
function generateRandomNotes(semestre) {
  const ues = UE_STRUCTURES[semestre] || UE_STRUCTURES[1];
  const anneeActuelle = new Date().getFullYear();

  let totalCredits = 0;
  let totalCreditsValides = 0;
  let sommePonderee = 0;

  const rows = ues.map((ue) => {
    // Générer des notes pour chaque ECU
    const ecuNotes = ue.ecus.map((ecu) => ({
      ...ecu,
      note: randNote(7, 19),
    }));

    // Moyenne UE = moyenne simple des ECU
    const moyUE =
      Math.round(
        (ecuNotes.reduce((s, e) => s + e.note, 0) / ecuNotes.length) * 100
      ) / 100;

    const valide = moyUE >= 10;
    const sessionValidation = valide
      ? `VALIDE EN Févr ${anneeActuelle}`
      : `NON VALIDE — Sept ${anneeActuelle}`;

    totalCredits += ue.credits;
    if (valide) totalCreditsValides += ue.credits;
    sommePonderee += moyUE * ue.credits;

    return {
      ...ue,
      moyUE,
      cote: getCote(moyUE),
      valide,
      sessionValidation,
      ecus: ecuNotes,
    };
  });

  const moyenneSemestrielle =
    Math.round((sommePonderee / totalCredits) * 100) / 100;
  const creditsCapitalises =
    Math.round((totalCreditsValides / totalCredits) * 10000) / 100;
  const decision = moyenneSemestrielle >= 10 ? "Continue" : "Redouble";

  return { rows, moyenneSemestrielle, creditsCapitalises, decision, totalCredits };
}

// ─────────────────────────────────────────────
// TEMPLATE HTML
// ─────────────────────────────────────────────

function buildHtml({
  // Institution
  logoUACBase64,
  logoInstitutionBase64,
  institutionNom,
  institutionSigle,
  directeurNom,
  directeurTitre,
  directeurAdjointNom,
  directeurAdjointTitre,
  tamponDABase64,
  tamponDIRBase64,
  // Etudiant
  etudiantNom,
  etudiantPrenom,
  etudiantMatricule,
  etudiantFiliere,
  etudiantNiveau,
  // Demande
  reference,
  semestre,
  anneeAcademique,
  // Notes
  notes,
  // QR
  qrBase64,
  // Date
  dateGeneration,
}) {
  const { rows, moyenneSemestrielle, creditsCapitalises, decision } = notes;
  const semestreLabel =
    semestre === 1
      ? "Premier"
      : semestre === 2
      ? "Deuxième"
      : semestre === 3
      ? "Troisième"
      : semestre === 4
      ? "Quatrième"
      : semestre === 5
      ? "Cinquième"
      : "Sixième";

  // Génère les lignes du tableau
  const tableRows = rows
    .map(
      (ue) => `
    <!-- UE: ${ue.code} -->
    <tr class="row-ue">
      <td class="cell-code">${ue.code}</td>
      <td class="cell-intitule">${ue.intitule}</td>
      <td class="cell-num">${ue.credits}</td>
      <td class="cell-num">${ue.moyUE.toFixed(2)}/20</td>
      <td class="cell-cote">${ue.cote}</td>
      <td class="cell-result">${ue.sessionValidation}</td>
    </tr>
    ${ue.ecus
      .map(
        (ecu) => `
    <tr class="row-ecu">
      <td class="cell-code">${ecu.code}</td>
      <td class="cell-intitule ecu-indent">${ecu.intitule}</td>
      <td class="cell-empty"></td>
      <td class="cell-num">${ecu.note.toFixed(2)}/20</td>
      <td class="cell-empty"></td>
      <td class="cell-empty"></td>
    </tr>`
      )
      .join("")}
  `
    )
    .join("");

  const logoUACSrc = logoUACBase64
    ? `<img src="${logoUACBase64}" class="logo-img" alt="UAC"/>`
    : `<div class="logo-placeholder">UAC</div>`;

  const logoInstSrc = logoInstitutionBase64
    ? `<img src="${logoInstitutionBase64}" class="logo-ifri-img" alt="${institutionSigle}"/>`
    : `<div class="logo-ifri-text">${institutionSigle || "IFRI"}</div>`;

  const tamponDASrc = tamponDABase64
    ? `<img src="${tamponDABase64}" class="stamp-img" alt="Tampon DA"/>`
    : `<div class="stamp-placeholder">Tampon<br>Dir. Adjoint</div>`;

  const tamponDIRSrc = tamponDIRBase64
    ? `<img src="${tamponDIRBase64}" class="stamp-img" alt="Tampon DIR"/>`
    : `<div class="stamp-placeholder">Tampon<br>Directeur</div>`;

  const qrSrc = qrBase64
    ? `<img src="${qrBase64}" style="width:100%;height:100%;" alt="QR Code"/>`
    : `<div style="font-size:5pt;color:#666;text-align:center;">QR<br>Code</div>`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }

  html, body {
    width: 210mm;
    font-family: 'Times New Roman', Times, serif;
    color: #111;
    font-size: 8.5pt;
    background: #ffc8c8;
  }

  .page {
    width: 210mm;
    min-height: 297mm;
    padding: 5mm 7mm 5mm 7mm;
    background: #ffc8c8;
  }

  /* ── HEADER ── */
  .header {
    display: grid;
    grid-template-columns: 22mm 1fr 22mm;
    align-items: flex-start;
    gap: 2mm;
    margin-bottom: 1.5mm;
  }

  .logo-img { width:20mm; height:20mm; object-fit:contain; }
  .logo-ifri-img { width:20mm; height:14mm; object-fit:contain; justify-self:end; display:block; margin-left:auto; }
  .logo-placeholder {
    width:20mm; height:20mm; border-radius:50%;
    border:1.5px solid #888; display:flex; align-items:center;
    justify-content:center; font-size:6pt; color:#666;
    background:#f0e8e0; text-align:center;
  }
  .logo-ifri-text {
    width:20mm; height:14mm; border:1.5px solid #1a4e8a;
    display:flex; align-items:center; justify-content:center;
    font-size:9pt; font-weight:900; color:#1a4e8a;
    background:white; letter-spacing:1px; justify-self:end; margin-left:auto;
  }

  .header-center { text-align:center; line-height:1.4; }
  .univ-name { font-size:12.5pt; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; }
  .ifri-name { font-size:9pt; font-weight:700; text-transform:uppercase; margin-top:1px; }
  .header-sep { border:none; border-top:1px solid #333; margin:2px 20mm; }
  .header-addr { font-size:7pt; color:#333; margin-top:1px; }
  .header-web { font-size:7pt; color:#333; font-style:italic; }

  /* ── NUMÉRO DE DOCUMENT ── */
  .doc-number-line {
    text-align:center; font-size:8.5pt; margin:1.5mm 0;
  }
  .doc-ref {
    font-family:'Courier New', monospace; font-size:8pt;
    font-weight:700; color:#1a1a1a; letter-spacing:0.5px;
  }

  /* ── BLOC ÉTUDIANT ── */
  .student-block {
    display:grid; grid-template-columns:16mm 1fr 20mm;
    gap:2mm; margin-bottom:2mm; align-items:start;
  }

  .qr-box {
    width:15mm; height:15mm; border:1px solid #555;
    display:flex; align-items:center; justify-content:center;
    overflow:hidden;
  }

  .info-table { font-size:8pt; line-height:1.65; }
  .info-row { display:flex; gap:1mm; }
  .info-lbl { min-width:50mm; color:#222; }
  .info-sep { margin-right:1mm; }
  .info-val { font-weight:400; }
  .info-val.bold { font-weight:700; }

  .photo-box {
    width:19mm; height:24mm; border:1.5px solid #777;
    display:flex; align-items:center; justify-content:center;
    font-size:5pt; color:#777; background:#e8ddd5; text-align:center;
  }

  /* ── TITRE ── */
  .releve-title {
    text-align:center; font-size:10.5pt; font-style:italic;
    text-decoration:underline; font-weight:600;
    margin:2mm 0 1.5mm 0;
  }

  /* ── TABLEAU NOTES ── */
  table.notes {
    width:100%; border-collapse:collapse; font-size:7.8pt;
  }

  table.notes thead tr { background:#6b6b6b; color:white; }
  table.notes th {
    padding:3.5px 4px; border:1px solid #555;
    font-size:7.5pt; font-weight:700; text-align:center;
    font-family:Arial, sans-serif;
  }
  table.notes th:nth-child(2) { text-align:left; }

  table.notes td {
    padding:2px 4px; border:1px solid #bbb;
    vertical-align:middle; line-height:1.3;
  }

  /* Lignes UE parent */
  .row-ue { background:#6b6b6b; color:white; }
  .row-ue td {
    border-color:#555; font-weight:700;
    font-family:Arial, sans-serif; font-size:7.8pt;
  }

  /* Lignes ECU enfant */
  .row-ecu { background:#ffc8c8; color:#111; }
  .row-ecu td { border-color:#d4a0a0; font-size:7.5pt; }

  .cell-code { text-align:center; font-family:'Courier New',monospace; font-size:6.8pt; white-space:nowrap; }
  .cell-intitule { text-align:left; }
  .ecu-indent { padding-left:8px !important; font-style:italic; color:#333; }
  .cell-num { text-align:center; font-variant-numeric:tabular-nums; }
  .cell-cote { text-align:center; font-weight:700; }
  .cell-result { text-align:center; font-size:7pt; white-space:nowrap; }
  .cell-empty { background:#ffc8c8; }

  /* ── BARRE RÉSUMÉ ── */
  .summary-bar {
    display:flex; border:1.5px solid #333;
    margin-top:2mm; font-size:8pt;
  }
  .sum-item {
    flex:1; padding:3px 6px; text-align:center;
    border-right:1px solid #333;
  }
  .sum-item:last-child { border-right:none; }
  .sum-label { font-size:6.8pt; color:#444; display:block; }
  .sum-val { font-weight:700; font-size:9pt; display:block; }

  /* ── LÉGENDE ── */
  .legend {
    font-size:5.8pt; color:#444; margin-top:1.5mm;
    line-height:1.5; border-top:1px solid #aaa; padding-top:1mm;
  }

  /* ── DATE ── */
  .date-line {
    text-align:right; font-size:8pt; color:#222;
    margin-top:1.5mm; font-style:italic;
  }
  .date-val {
    font-family:'Courier New',monospace; font-size:11pt;
    font-weight:700; font-style:normal;
    border-bottom:1.5px solid #333; padding:0 3px;
  }

  /* ── SIGNATURES ── */
  .signatures {
    display:grid; grid-template-columns:1fr 1fr;
    gap:6mm; margin-top:2mm;
  }
  .sig-block { text-align:center; }
  .sig-title { font-size:8.5pt; font-weight:700; margin-bottom:1px; }
  .sig-subtitle { font-size:7pt; font-style:italic; color:#444; margin-bottom:1.5mm; }

  .sig-zone {
    width:32mm; height:32mm; margin:0 auto 1.5mm;
    position:relative; display:flex; align-items:center; justify-content:center;
  }
  .stamp-img { width:32mm; height:32mm; object-fit:contain; }
  .stamp-placeholder {
    width:32mm; height:32mm; border:2px dashed #1a4e8a;
    border-radius:50%; display:flex; align-items:center;
    justify-content:center; font-size:5.5pt; color:#1a4e8a;
    text-align:center; line-height:1.5;
  }

  .sig-name { font-size:8.5pt; font-weight:700; text-decoration:underline; }

  @media print {
    html, body { width:210mm; background:#ffc8c8; }
    @page { size:A4; margin:0; }
    .page { min-height:297mm; }
  }
</style>
</head>
<body>
<div class="page">

  <!-- ═══ HEADER ═══ -->
  <div class="header">
    ${logoUACSrc}
    <div class="header-center">
      <div class="univ-name">Université d'Abomey-Calavi</div>
      <div class="ifri-name">${institutionNom || "Institut de Formation et de Recherche en Informatique"}</div>
      <hr class="header-sep">
      <div class="header-addr">BP: 526 COTONOU — TÉL : (+229) 55-028-070</div>
      <div class="header-web">Site web : https://www.ifri-uac.bj — Courriel : contact@ifri.uac.bj</div>
    </div>
    ${logoInstSrc}
  </div>

  <!-- ═══ RÉFÉRENCE DOCUMENT ═══ -->
  <div class="doc-number-line">
    <span style="font-style:italic;">N°</span>
    <span class="doc-ref">&nbsp;${reference}&nbsp;</span>
  </div>

  <!-- ═══ BLOC ÉTUDIANT ═══ -->
  <div class="student-block">
    <div class="qr-box">${qrSrc}</div>

    <div class="info-table">
      <div class="info-row">
        <span class="info-lbl">Année académique</span>
        <span class="info-sep">:</span>
        <span class="info-val">${anneeAcademique}</span>
      </div>
      <div class="info-row">
        <span class="info-lbl">Domaine</span>
        <span class="info-sep">:</span>
        <span class="info-val">Sciences et Technologies</span>
      </div>
      <div class="info-row">
        <span class="info-lbl">Grade</span>
        <span class="info-sep">:</span>
        <span class="info-val">Licence</span>
      </div>
      <div class="info-row">
        <span class="info-lbl">Mention</span>
        <span class="info-sep">:</span>
        <span class="info-val">Informatique</span>
      </div>
      <div class="info-row">
        <span class="info-lbl">Spécialité</span>
        <span class="info-sep">:</span>
        <span class="info-val">${etudiantFiliere || "—"}</span>
      </div>
      <div class="info-row">
        <span class="info-lbl">Nom et Prénoms</span>
        <span class="info-sep">:</span>
        <span class="info-val bold">${etudiantNom} ${etudiantPrenom}</span>
      </div>
      <div class="info-row">
        <span class="info-lbl">Sexe</span>
        <span class="info-sep">:</span>
        <span class="info-val">—</span>
      </div>
      <div class="info-row">
        <span class="info-lbl">Date et lieu de naissance</span>
        <span class="info-sep">:</span>
        <span class="info-val">—</span>
      </div>
      <div class="info-row">
        <span class="info-lbl">Numéro matricule</span>
        <span class="info-sep">:</span>
        <span class="info-val">${etudiantMatricule || "—"}</span>
      </div>
    </div>

    <div class="photo-box">Photo<br>étudiant</div>
  </div>

  <!-- ═══ TITRE ═══ -->
  <div class="releve-title">Relevé de notes du ${semestreLabel} semestre</div>

  <!-- ═══ TABLEAU ═══ -->
  <table class="notes">
    <thead>
      <tr>
        <th style="width:11%">Code UE</th>
        <th style="width:37%">Intitulé de l'UE/ECU</th>
        <th style="width:7%">Crédit</th>
        <th style="width:12%">Moy. UE/ECU</th>
        <th style="width:6%">Cote</th>
        <th style="width:27%">Résultat</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
  </table>

  <!-- ═══ RÉSUMÉ ═══ -->
  <div class="summary-bar">
    <div class="sum-item">
      <span class="sum-label">Crédits capitalisés</span>
      <span class="sum-val">${creditsCapitalises.toFixed(2)} %</span>
    </div>
    <div class="sum-item">
      <span class="sum-label">Moyenne semestrielle pondérée</span>
      <span class="sum-val">${moyenneSemestrielle.toFixed(2)} / 20</span>
    </div>
    <div class="sum-item">
      <span class="sum-label">Décision du jury</span>
      <span class="sum-val">${decision}</span>
    </div>
  </div>

  <!-- ═══ LÉGENDE ═══ -->
  <div class="legend">
    (UE = Unité d'Enseignement) et (ECU = Élément Constitutif d'Unité d'Enseignement)
    (Moyenne semestrielle pondérée = Somme(moyenne UE × crédit UE) / Somme crédits UE)
    (Crédits capitalisés — Semestre ${semestre})<br>
    |16,20|⇒A+ / 16⇒A / |15,16|⇒A− / |14⇒B+ / |13,14|⇒B− / |12,13|⇒C+ / 12⇒C / |11,12|⇒C− / |10,11|⇒D+ / |05,10|⇒D / |00,05|⇒F / 00⇒N/A — Si nombre de 0 > 5 ⇒ N (Abandon)
  </div>

  <!-- ═══ DATE ═══ -->
  <div class="date-line">
    Abomey-Calavi, le&nbsp;<span class="date-val">${dateGeneration}</span>
  </div>

  <!-- ═══ SIGNATURES ═══ -->
  <div class="signatures">
    <div class="sig-block">
      <div class="sig-title">Le Directeur-Adjoint,</div>
      <div class="sig-subtitle">${directeurAdjointTitre || "Chargé des affaires académiques"}</div>
      <div class="sig-zone">${tamponDASrc}</div>
      <div class="sig-name">${directeurAdjointNom || "Le Directeur Adjoint"}</div>
    </div>
    <div class="sig-block">
      <div class="sig-title">Le Directeur,</div>
      <div class="sig-subtitle">&nbsp;</div>
      <div class="sig-zone">${tamponDIRSrc}</div>
      <div class="sig-name">${directeurNom || "Le Directeur"}</div>
    </div>
  </div>

</div>
</body>
</html>`;
}

// ─────────────────────────────────────────────
// FONCTION PRINCIPALE
// ─────────────────────────────────────────────

/**
 * Génère un PDF de relevé de notes ou d'attestation.
 *
 * @param {Object} demande     - Objet Demande depuis Prisma (avec .semestre injecté)
 * @param {Object} etudiant    - Objet Utilisateur depuis Prisma
 * @param {null}   notesData   - Réservé pour future intégration BD des notes (null pour l'instant)
 * @param {string} reference   - Référence unique du document (ex: ETD-2026-IFRI-S1-XXXXX)
 * @param {Object} institution - Objet Institution depuis Prisma
 * @param {string} qrData      - URL encodée dans le QR code
 * @returns {Promise<string>}  - Chemin absolu du PDF généré
 */
exports.generateDocument = async (
  demande,
  etudiant,
  notesData,
  reference,
  institution,
  qrData
) => {
  // ── 1. Préparer les assets (en parallèle) ──
  const [logoUACBase64, logoInstitutionBase64, tamponDABase64, tamponDIRBase64, qrBase64] =
    await Promise.all([
      Promise.resolve(getLogoUAC()),
      Promise.resolve(getLogoInstitution(institution)),
      Promise.resolve(getTamponDA(institution)),
      Promise.resolve(getTamponDIR(institution)),
      generateQRDataURL(qrData),
    ]);

  // ── 2. Infos étudiant ──
  const etudiantNom = (etudiant?.nom || "").toUpperCase();
  const etudiantPrenom = etudiant?.prenom || "";
  const etudiantMatricule = etudiant?.numeroEtudiant || "";
  const etudiantFiliere = etudiant?.filiere || "";
  const etudiantNiveau = etudiant?.niveau || "";

  // ── 3. Infos institution ──
  const institutionNom = institution?.nom || "";
  const institutionSigle = institution?.sigle || "IFRI";
  const directeurNom = institution?.directeurNom || "";
  const directeurTitre = institution?.directeurTitre || "";
  const directeurAdjointNom = institution?.directeurAdjointNom || "";
  const directeurAdjointTitre = institution?.directeurAdjointTitre || "";

  // ── 4. Semestre et année académique ──
  const semestre = demande?.semestre || (demande?.semestres?.[0]) || 1;
  const now = new Date();
  const annee = now.getFullYear();
  const anneeAcademique = `${annee - 1}-${annee}`;
  const dateGeneration = now.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // ── 5. Générer les notes (aléatoires pour l'instant) ──
  const notes = generateRandomNotes(semestre);

  // ── 6. Construire le HTML ──
  const html = buildHtml({
    logoUACBase64,
    logoInstitutionBase64,
    institutionNom,
    institutionSigle,
    directeurNom,
    directeurTitre,
    directeurAdjointNom,
    directeurAdjointTitre,
    tamponDABase64,
    tamponDIRBase64,
    etudiantNom,
    etudiantPrenom,
    etudiantMatricule,
    etudiantFiliere,
    etudiantNiveau,
    reference,
    semestre,
    anneeAcademique,
    notes,
    qrBase64,
    dateGeneration,
  });

  // ── 7. Lancer Puppeteer ──
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
  });

  try {
    const page = await browser.newPage();

    // Injecter le HTML directement (les images sont en base64, pas besoin de serveur)
    await page.setContent(html, { waitUntil: "networkidle0" });

    // Chemin de sortie
    const fileName = `${reference}.pdf`;
    const outputPath = path.join(OUTPUT_DIR, fileName);

    await page.pdf({
      path: outputPath,
      format: "A4",
      printBackground: true, // ← CRUCIAL pour le fond rose
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    return outputPath;
  } finally {
    await browser.close();
  }
};