/**
 * pdf.service.js
 * Service de génération PDF pour EtuDocs
 * Chemin: backend/src/services/pdf.service.js
 *
 * Objectifs:
 * - Zéro dépendance réseau lors du rendu PDF (logos/tampons en base64)
 * - Pas de waitUntil "networkidle0" (source fréquente de timeouts)
 * - Timeouts configurables + logs utiles
 * - Compatible Docker/CI/Prod (executablePath optionnel)
 */

const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
const QRCode = require("qrcode");
const http = require("http");
const https = require("https");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────

const ASSETS_DIR = path.resolve(__dirname, "../assets");
const OUTPUT_DIR = path.resolve(process.cwd(), "uploads", "pdfs");

// Timeouts (ms)
const PDF_TIMEOUT_MS = Number(process.env.PDF_TIMEOUT_MS || 60000); // 60s par défaut
const REMOTE_ASSET_TIMEOUT_MS = Number(process.env.REMOTE_ASSET_TIMEOUT_MS || 8000); // 8s par défaut
const REMOTE_ASSET_MAX_BYTES = Number(process.env.REMOTE_ASSET_MAX_BYTES || 2_500_000); // ~2.5MB

// Chromium path (utile en prod)
const PUPPETEER_EXECUTABLE_PATH = process.env.PUPPETEER_EXECUTABLE_PATH || "";

// Logs
const DEBUG_PDF = String(process.env.DEBUG_PDF || "").toLowerCase() === "true";
const log = (...args) => DEBUG_PDF && console.log("[pdf.service]", ...args);

// Crée le dossier de sortie si inexistant
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// ─────────────────────────────────────────────
// UTILITAIRES ASSETS
// ─────────────────────────────────────────────

function detectMimeFromExt(ext) {
  const e = String(ext || "").toLowerCase().replace(".", "");
  if (e === "jpg" || e === "jpeg") return "image/jpeg";
  if (e === "png") return "image/png";
  if (e === "webp") return "image/webp";
  if (e === "svg") return "image/svg+xml";
  return "application/octet-stream";
}

function bufferToDataUrl(buf, mime) {
  if (!buf || !Buffer.isBuffer(buf)) return null;
  const b64 = buf.toString("base64");
  return `data:${mime};base64,${b64}`;
}

function isHttpUrl(s) {
  return typeof s === "string" && (s.startsWith("http://") || s.startsWith("https://"));
}

/**
 * Télécharge un asset distant (URL) et le convertit en Data URL base64.
 * - timeout strict
 * - limite de taille (anti OOM)
 * - suit 1 redirection max (simple)
 */
function fetchRemoteAsDataUrl(url, timeoutMs = REMOTE_ASSET_TIMEOUT_MS) {
  return new Promise((resolve) => {
    try {
      if (!isHttpUrl(url)) return resolve(null);

      const client = url.startsWith("https://") ? https : http;
      const req = client.get(
        url,
        {
          headers: {
            "User-Agent": "EtuDocs-PDF/1.0",
            Accept: "image/*,*/*;q=0.8",
          },
        },
        (res) => {
          // Redirection simple (1 niveau)
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            const next = res.headers.location.startsWith("http")
              ? res.headers.location
              : new URL(res.headers.location, url).toString();
            res.resume();
            return resolve(fetchRemoteAsDataUrl(next, timeoutMs));
          }

          if (res.statusCode !== 200) {
            res.resume();
            return resolve(null);
          }

          const contentType = res.headers["content-type"] || "application/octet-stream";
          const chunks = [];
          let total = 0;

          res.on("data", (chunk) => {
            total += chunk.length;
            if (total > REMOTE_ASSET_MAX_BYTES) {
              // stop téléchargement (anti OOM)
              req.destroy();
              return resolve(null);
            }
            chunks.push(chunk);
          });

          res.on("end", () => {
            const buf = Buffer.concat(chunks);
            return resolve(bufferToDataUrl(buf, contentType.split(";")[0]));
          });
        }
      );

      req.setTimeout(timeoutMs, () => {
        req.destroy();
        resolve(null);
      });

      req.on("error", () => resolve(null));
    } catch (e) {
      resolve(null);
    }
  });
}

/**
 * Convertit une image (chemin local) en base64 data URL pour l'embarquer dans le HTML.
 * Supporte aussi les URLs distantes, mais on LES EMBARQUE (download + base64) pour éviter timeouts.
 */
async function imageToDataUrl(filePathOrUrl) {
  try {
    if (!filePathOrUrl) return null;

    // URL distante -> on télécharge et on embed
    if (isHttpUrl(filePathOrUrl)) {
      const remote = await fetchRemoteAsDataUrl(filePathOrUrl);
      return remote; // peut être null => fallback géré plus haut
    }

    // Local
    const abs = path.isAbsolute(filePathOrUrl)
      ? filePathOrUrl
      : path.resolve(process.cwd(), filePathOrUrl);

    if (!fs.existsSync(abs)) return null;

    const ext = path.extname(abs);
    const mime = detectMimeFromExt(ext);
    const data = fs.readFileSync(abs);
    return bufferToDataUrl(data, mime);
  } catch {
    return null;
  }
}

/**
 * Logo d'institution:
 * - priorité: institution.logoUrl (embed)
 * - fallback: assets/logos/<SIGLE>.png
 */
async function getLogoInstitution(institution) {
  if (institution?.logoUrl) {
    const embedded = await imageToDataUrl(institution.logoUrl);
    if (embedded) return embedded;
  }
  const sigle = (institution?.sigle || "IFRI").toUpperCase();
  const localPath = path.join(ASSETS_DIR, "logos", `${sigle}.png`);
  return imageToDataUrl(localPath);
}

async function getLogoUAC() {
  return imageToDataUrl(path.join(ASSETS_DIR, "logos", "UAC.png"));
}

async function getTamponDA(institution) {
  if (institution?.tamponDirecteurAdjointUrl) {
    const embedded = await imageToDataUrl(institution.tamponDirecteurAdjointUrl);
    if (embedded) return embedded;
  }
  return imageToDataUrl(path.join(ASSETS_DIR, "stamps", "DA.png"));
}

async function getTamponDIR(institution) {
  if (institution?.tamponDirecteurUrl) {
    const embedded = await imageToDataUrl(institution.tamponDirecteurUrl);
    if (embedded) return embedded;
  }
  return imageToDataUrl(path.join(ASSETS_DIR, "stamps", "DIR.png"));
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
// STRUCTURE UE + NOTES (inchangé)
// ─────────────────────────────────────────────

const UE_STRUCTURES = {
  1: [
    {
      code: "MTH1121",
      intitule: "LOGIQUE, ARITHMÉTIQUE ET SES APPLICATIONS",
      credits: 5,
      ecus: [{ code: "1MTH1121", intitule: "Logique, arithmétique et applications" }],
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
        { code: "1MTH1123", intitule: "Analyse combinatoire, calcul des probabilités et applications" },
        { code: "2MTH1123", intitule: "Statistiques inférentielles et applications" },
      ],
    },
    {
      code: "INF1124",
      intitule: "ARCHITECTURE ET TOPOLOGIE DES RÉSEAUX INFORMATIQUES",
      credits: 4,
      ecus: [{ code: "1INF1124", intitule: "Architecture et topologie des réseaux informatiques" }],
    },
    {
      code: "INF1125",
      intitule: "SYSTÈME D'EXPLOITATION ET OUTILS DE BASE EN INFORMATIQUE",
      credits: 4,
      ecus: [
        { code: "1INF1125", intitule: "Utilisation et administration sous Windows/Linux" },
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
      ecus: [{ code: "1DRP1127", intitule: "Déontologie et droit liés aux TIC" }],
    },
    {
      code: "TCC1128",
      intitule: "TECHNIQUES D'EXPRESSION ÉCRITE ET ORALE",
      credits: 1,
      ecus: [{ code: "1TCC1128", intitule: "Techniques d'expression écrite et orale" }],
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
      ecus: [{ code: "1DRP1226", intitule: "Cybercriminalité et protection des données" }],
    },
    {
      code: "TCC1227",
      intitule: "COMMUNICATION PROFESSIONNELLE",
      credits: 1,
      ecus: [{ code: "1TCC1227", intitule: "Rédaction professionnelle et présentation orale" }],
    },
  ],
};

function randNote(min = 8, max = 19) {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

function getCote(note) {
  if (note >= 16) return "A+";
  if (note >= 15) return "A";
  if (note >= 14) return "A−";
  if (note >= 13) return "B+";
  if (note >= 12) return "B−";
  if (note >= 11) return "C+";
  if (note >= 10) return "C";
  if (note >= 9) return "C−";
  if (note >= 8) return "D+";
  if (note >= 5) return "D";
  return "F";
}

function generateRandomNotes(semestre) {
  const ues = UE_STRUCTURES[semestre] || UE_STRUCTURES[1];
  const anneeActuelle = new Date().getFullYear();

  let totalCredits = 0;
  let totalCreditsValides = 0;
  let sommePonderee = 0;

  const rows = ues.map((ue) => {
    const ecuNotes = ue.ecus.map((ecu) => ({
      ...ecu,
      note: randNote(7, 19),
    }));

    const moyUE =
      Math.round((ecuNotes.reduce((s, e) => s + e.note, 0) / ecuNotes.length) * 100) / 100;

    const valide = moyUE >= 10;
    const sessionValidation = valide ? `VALIDE EN Févr ${anneeActuelle}` : `NON VALIDE — Sept ${anneeActuelle}`;

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

  const moyenneSemestrielle = Math.round((sommePonderee / totalCredits) * 100) / 100;
  const creditsCapitalises = Math.round((totalCreditsValides / totalCredits) * 10000) / 100;
  const decision = moyenneSemestrielle >= 10 ? "Continue" : "Redouble";

  return { rows, moyenneSemestrielle, creditsCapitalises, decision, totalCredits };
}

// ─────────────────────────────────────────────
// TEMPLATE HTML (inchangé chez toi)
// ─────────────────────────────────────────────
// NOTE: je reprends ton buildHtml tel quel pour éviter de casser le rendu.
// Seule différence: les images distantes seront désormais embed en base64.

function buildHtml(payload) {
  const {
    logoUACBase64,
    logoInstitutionBase64,
    institutionNom,
    institutionSigle,
    directeurNom,
    directeurTitre, // gardé même si non affiché
    directeurAdjointNom,
    directeurAdjointTitre,
    tamponDABase64,
    tamponDIRBase64,
    etudiantNom,
    etudiantPrenom,
    etudiantMatricule,
    etudiantFiliere,
    etudiantNiveau, // gardé même si non affiché
    reference,
    semestre,
    anneeAcademique,
    notes,
    qrBase64,
    dateGeneration,
  } = payload;

  const { rows, moyenneSemestrielle, creditsCapitalises, decision } = notes;

  const semestreLabel =
    semestre === 1 ? "Premier" :
    semestre === 2 ? "Deuxième" :
    semestre === 3 ? "Troisième" :
    semestre === 4 ? "Quatrième" :
    semestre === 5 ? "Cinquième" : "Sixième";

  const tableRows = rows
    .map(
      (ue) => `
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

  .doc-number-line {
    text-align:center; font-size:8.5pt; margin:1.5mm 0;
  }
  .doc-ref {
    font-family:'Courier New', monospace; font-size:8pt;
    font-weight:700; color:#1a1a1a; letter-spacing:0.5px;
  }

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

  .releve-title {
    text-align:center; font-size:10.5pt; font-style:italic;
    text-decoration:underline; font-weight:600;
    margin:2mm 0 1.5mm 0;
  }

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

  .row-ue { background:#6b6b6b; color:white; }
  .row-ue td {
    border-color:#555; font-weight:700;
    font-family:Arial, sans-serif; font-size:7.8pt;
  }

  .row-ecu { background:#ffc8c8; color:#111; }
  .row-ecu td { border-color:#d4a0a0; font-size:7.5pt; }

  .cell-code { text-align:center; font-family:'Courier New',monospace; font-size:6.8pt; white-space:nowrap; }
  .cell-intitule { text-align:left; }
  .ecu-indent { padding-left:8px !important; font-style:italic; color:#333; }
  .cell-num { text-align:center; font-variant-numeric:tabular-nums; }
  .cell-cote { text-align:center; font-weight:700; }
  .cell-result { text-align:center; font-size:7pt; white-space:nowrap; }
  .cell-empty { background:#ffc8c8; }

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

  .legend {
    font-size:5.8pt; color:#444; margin-top:1.5mm;
    line-height:1.5; border-top:1px solid #aaa; padding-top:1mm;
  }

  .date-line {
    text-align:right; font-size:8pt; color:#222;
    margin-top:1.5mm; font-style:italic;
  }
  .date-val {
    font-family:'Courier New',monospace; font-size:11pt;
    font-weight:700; font-style:normal;
    border-bottom:1.5px solid #333; padding:0 3px;
  }

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

  <div class="doc-number-line">
    <span style="font-style:italic;">N°</span>
    <span class="doc-ref">&nbsp;${reference}&nbsp;</span>
  </div>

  <div class="student-block">
    <div class="qr-box">${qrSrc}</div>

    <div class="info-table">
      <div class="info-row"><span class="info-lbl">Année académique</span><span class="info-sep">:</span><span class="info-val">${anneeAcademique}</span></div>
      <div class="info-row"><span class="info-lbl">Domaine</span><span class="info-sep">:</span><span class="info-val">Sciences et Technologies</span></div>
      <div class="info-row"><span class="info-lbl">Grade</span><span class="info-sep">:</span><span class="info-val">Licence</span></div>
      <div class="info-row"><span class="info-lbl">Mention</span><span class="info-sep">:</span><span class="info-val">Informatique</span></div>
      <div class="info-row"><span class="info-lbl">Spécialité</span><span class="info-sep">:</span><span class="info-val">${etudiantFiliere || "—"}</span></div>
      <div class="info-row"><span class="info-lbl">Nom et Prénoms</span><span class="info-sep">:</span><span class="info-val bold">${etudiantNom} ${etudiantPrenom}</span></div>
      <div class="info-row"><span class="info-lbl">Sexe</span><span class="info-sep">:</span><span class="info-val">—</span></div>
      <div class="info-row"><span class="info-lbl">Date et lieu de naissance</span><span class="info-sep">:</span><span class="info-val">—</span></div>
      <div class="info-row"><span class="info-lbl">Numéro matricule</span><span class="info-sep">:</span><span class="info-val">${etudiantMatricule || "—"}</span></div>
    </div>

    <div class="photo-box">Photo<br>étudiant</div>
  </div>

  <div class="releve-title">Relevé de notes du ${semestreLabel} semestre</div>

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
    <tbody>${tableRows}</tbody>
  </table>

  <div class="summary-bar">
    <div class="sum-item"><span class="sum-label">Crédits capitalisés</span><span class="sum-val">${creditsCapitalises.toFixed(2)} %</span></div>
    <div class="sum-item"><span class="sum-label">Moyenne semestrielle pondérée</span><span class="sum-val">${moyenneSemestrielle.toFixed(2)} / 20</span></div>
    <div class="sum-item"><span class="sum-label">Décision du jury</span><span class="sum-val">${decision}</span></div>
  </div>

  <div class="legend">
    (UE = Unité d'Enseignement) et (ECU = Élément Constitutif d'Unité d'Enseignement)
    (Moyenne semestrielle pondérée = Somme(moyenne UE × crédit UE) / Somme crédits UE)
    (Crédits capitalisés — Semestre ${semestre})<br>
    |16,20|⇒A+ / 16⇒A / |15,16|⇒A− / |14⇒B+ / |13,14|⇒B− / |12,13|⇒C+ / 12⇒C / |11,12|⇒C− / |10,11|⇒D+ / |05,10|⇒D / |00,05|⇒F / 00⇒N/A — Si nombre de 0 > 5 ⇒ N (Abandon)
  </div>

  <div class="date-line">
    Abomey-Calavi, le&nbsp;<span class="date-val">${dateGeneration}</span>
  </div>

  <div class="signatures">
    <div class="sig-block">
      <div class="sig-title">Le Directeur-Adjoint,</div>
      <div class="sig-subtitle">${directeurAdjointTitre || "Chargé des affaires académiques"}</div>
      <div class="sig-zone">
        ${tamponDASrc}
      </div>
      <div class="sig-name">${directeurAdjointNom || "Le Directeur Adjoint"}</div>
    </div>
    <div class="sig-block">
      <div class="sig-title">Le Directeur,</div>
      <div class="sig-subtitle">&nbsp;</div>
      <div class="sig-zone">
        ${tamponDIRSrc}
      </div>
      <div class="sig-name">${directeurNom || "Le Directeur"}</div>
    </div>
  </div>

</div>
</body>
</html>`;
}

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────

exports.generateDocument = async (demande, etudiant, notesData, reference, institution, qrData) => {
  // 1) Assets (désormais: URL distante => embed => pas de réseau côté Chromium)
  const [logoUACBase64, logoInstitutionBase64, tamponDABase64, tamponDIRBase64, qrBase64] =
    await Promise.all([
      getLogoUAC(),
      getLogoInstitution(institution),
      getTamponDA(institution),
      getTamponDIR(institution),
      generateQRDataURL(qrData),
    ]);

  // 2) Infos étudiant
  const etudiantNom = (etudiant?.nom || "").toUpperCase();
  const etudiantPrenom = etudiant?.prenom || "";
  const etudiantMatricule = etudiant?.numeroEtudiant || "";
  const etudiantFiliere = etudiant?.filiere || "";
  const etudiantNiveau = etudiant?.niveau || "";

  // 3) Infos institution
  const institutionNom = institution?.nom || "";
  const institutionSigle = institution?.sigle || "IFRI";
  const directeurNom = institution?.directeurNom || "";
  const directeurTitre = institution?.directeurTitre || "";
  const directeurAdjointNom = institution?.directeurAdjointNom || "";
  const directeurAdjointTitre = institution?.directeurAdjointTitre || "";

  // 4) Semestre et année académique
  const semestre = demande?.semestre || (demande?.semestres?.[0]) || 1;
  const now = new Date();
  const annee = now.getFullYear();
  const anneeAcademique = `${annee - 1}-${annee}`;
  const dateGeneration = now.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // 5) Notes (temp)
  const notes = generateRandomNotes(semestre);

  // 6) HTML
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

  // 7) Puppeteer (robuste)
  const launchOptions = {
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  };

  if (PUPPETEER_EXECUTABLE_PATH) {
    launchOptions.executablePath = PUPPETEER_EXECUTABLE_PATH;
  }

  const browser = await puppeteer.launch(launchOptions);

  try {
    const page = await browser.newPage();

    // Timeouts contrôlés
    page.setDefaultNavigationTimeout(PDF_TIMEOUT_MS);
    page.setDefaultTimeout(PDF_TIMEOUT_MS);

    // SetContent: surtout PAS networkidle0
    await page.setContent(html, { waitUntil: "domcontentloaded", timeout: PDF_TIMEOUT_MS });

    // Petite pause pour laisser le layout se stabiliser (fonts/paint)
    await new Promise((r) => setTimeout(r, 150));

    const fileName = `${reference}.pdf`;
    const outputPath = path.join(OUTPUT_DIR, fileName);

    log("Generating PDF:", outputPath);

    await page.pdf({
      path: outputPath,
      format: "A4",
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      timeout: PDF_TIMEOUT_MS,
    });

    return outputPath;
  } catch (e) {
    // Message propre (utile au frontend)
    const msg = e?.message || "Erreur génération PDF";
    log("PDF error:", msg);
    const err = new Error(`PDF_GENERATION_FAILED: ${msg}`);
    err.statusCode = 500;
    throw err;
  } finally {
    await browser.close();
  }
};

// ─────────────────────────────────────────────
// TEMPLATE HTML — ATTESTATION D'INSCRIPTION
// ─────────────────────────────────────────────

/**
 * Construit le HTML de l'attestation d'inscription UAC.
 * Toutes les données étudiant sont dynamiques.
 */
function buildAttestationInscriptionHtml({
                                           logoUACBase64,
                                           etudiantNom,
                                           etudiantPrenom,
                                           etudiantDateNaissance,
                                           etudiantLieuNaissance,
                                           etudiantMatricule,
                                           etudiantFiliere,
                                           etudiantSemestres,
                                           institutionNom,
                                           institutionSigle,
                                           anneeAcademique,
                                           dateGeneration,
                                           qrBase64,
                                         }) {
  // ── Construire les sources images ──
  const logoSrc = logoUACBase64
      ? `<img src="${logoUACBase64}" style="width:86px;height:86px;object-fit:contain;" alt="UAC"/>`
      : buildLogoSVG("top-arc-L", "bot-arc-L");

  const logoSrc2 = logoUACBase64
      ? `<img src="${logoUACBase64}" style="width:86px;height:86px;object-fit:contain;" alt="UAC"/>`
      : buildLogoSVG("top-arc-R", "bot-arc-R");

  const qrSrc = qrBase64
      ? `<img src="${qrBase64}" style="width:95px;height:95px;" alt="QR Code"/>`
      : buildQRPlaceholder();

  // ── Nom complet étudiant ──
  const nomComplet = `${(etudiantNom || "").toUpperCase()} ${etudiantPrenom || ""}`.trim();

  // ── Date de naissance formatée ──
  const dateNaissanceFormatee = etudiantDateNaissance
      ? new Date(etudiantDateNaissance).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
      : "—";

  // ── Lieu de naissance ──
  const lieuNaissance = etudiantLieuNaissance || "—";

  // ── Semestres libellé (ex: "Semestres 3 et 4") ──
  const semestresLabel = buildSemestresLabel(etudiantSemestres);

  // ── Filière / formation ──
  const filiere = etudiantFiliere || "Informatique";

  // ── Institution ──
  const institutionLabel = institutionNom
      ? `${institutionNom}${institutionSigle ? ` (${institutionSigle})` : ""}`
      : "INSTITUT DE FORMATION ET DE RECHERCHE EN INFORMATIQUE (IFRI)";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }

  html, body {
    width: 210mm;
    font-family: 'Times New Roman', Times, serif;
    color: #111;
    font-size: 10.5pt;
    background: #ffffff;
  }

  .page {
    width: 210mm;
    min-height: 297mm;
    background: #ffffff;
    padding: 12mm 18mm 20mm 18mm;
    position: relative;
    overflow: hidden;
  }

  /* ── Filigranes ── */
  .wm-word {
    position: absolute;
    font-family: 'Times New Roman', serif;
    font-size: 68px;
    font-style: italic;
    font-weight: bold;
    color: rgba(150, 190, 220, 0.11);
    transform: rotate(-30deg);
    white-space: nowrap;
    pointer-events: none;
    z-index: 0;
  }
  .wm-shape {
    position: absolute;
    opacity: 0.05;
    z-index: 0;
    pointer-events: none;
  }

  /* ── En-tête ── */
  .header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    z-index: 1;
    margin-bottom: 4px;
  }
  .logo-box {
    width: 86px;
    height: 86px;
    flex-shrink: 0;
  }
  .header-center {
    text-align: center;
    flex: 1;
    padding: 0 10px;
  }
  .univ-name {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 11.5pt;
    font-weight: 800;
    letter-spacing: 0.3px;
    margin-bottom: 3px;
  }
  .univ-sub {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 11pt;
    line-height: 1.55;
  }

  hr.sep {
    border: none;
    border-top: 1.2px solid #111;
    margin: 10px 0 0 0;
    position: relative;
    z-index: 1;
  }

  /* ── Titre ── */
  .doc-title {
    text-align: center;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 13pt;
    font-weight: 800;
    color: #1a7a2e;
    letter-spacing: 0.3px;
    margin: 18px 0 26px 0;
    position: relative;
    z-index: 1;
  }

  /* ── Corps ── */
  .body-text {
    font-family: 'Times New Roman', Times, serif;
    font-size: 11.5pt;
    line-height: 1.9;
    color: #000;
    text-align: justify;
    position: relative;
    z-index: 1;
  }
  .body-text p {
    margin-bottom: 22px;
  }
  .body-text p.full-line {
    text-align: justify;
    text-align-last: justify;
  }

  /* ── Signature ── */
  .sig-section {
    position: relative;
    z-index: 1;
    margin-top: 8px;
  }
  .sig-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    width: 100%;
  }
  .qr-area {
    width: 95px;
    flex-shrink: 0;
  }
  .stamp-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
  }
  .date-line {
    font-family: 'Times New Roman', Times, serif;
    font-size: 11.5pt;
    text-align: center;
    margin-bottom: 10px;
    color: #000;
    white-space: nowrap;
  }
  .prof-name {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 10pt;
    font-weight: bold;
    margin-top: 5px;
    text-align: center;
  }

  /* ── Tampon ── */
  .stamp-img {
    width: 110px;
    height: 110px;
    object-fit: contain;
  }
  .stamp-placeholder {
    width: 110px;
    height: 110px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* ── Pied de page ── */
  .footer {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    border-top: 1.2px solid #111;
    padding: 5px 18mm;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 7.5pt;
    color: #111;
    text-align: center;
    background: white;
    z-index: 2;
  }
</style>
</head>
<body>
<div class="page">

  <!-- Filigranes -->
  <span class="wm-word" style="top:60px;  left:-30px;">Agitat</span>
  <span class="wm-word" style="top:280px; left:200px;">Molem</span>
  <span class="wm-word" style="top:480px; left:-20px;">Mens</span>
  <span class="wm-word" style="top:680px; left:150px;">Agitat</span>

  <!-- Formes décoratives fond -->
  <svg class="wm-shape" style="top:50px;right:20px;width:90px;" viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="10" width="80" height="110" rx="4" fill="none" stroke="#3a7fc1" stroke-width="5"/>
    <line x1="25" y1="10" x2="25" y2="120" stroke="#3a7fc1" stroke-width="4"/>
    <line x1="30" y1="30" x2="80" y2="30" stroke="#3a7fc1" stroke-width="3"/>
    <line x1="30" y1="50" x2="80" y2="50" stroke="#3a7fc1" stroke-width="3"/>
    <line x1="30" y1="70" x2="80" y2="70" stroke="#3a7fc1" stroke-width="3"/>
  </svg>
  <svg class="wm-shape" style="top:400px;right:15px;width:80px;" viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="5" width="75" height="95" rx="3" fill="none" stroke="#3a7fc1" stroke-width="5"/>
    <line x1="25" y1="30" x2="72" y2="30" stroke="#3a7fc1" stroke-width="3"/>
    <line x1="25" y1="50" x2="72" y2="50" stroke="#3a7fc1" stroke-width="3"/>
    <line x1="25" y1="70" x2="55" y2="70" stroke="#3a7fc1" stroke-width="3"/>
  </svg>
  <svg class="wm-shape" style="top:180px;left:5px;width:70px;transform:rotate(-15deg);" viewBox="0 0 40 140" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="20" width="20" height="100" rx="2" fill="#3a7fc1"/>
    <polygon points="10,120 30,120 20,140" fill="#3a7fc1"/>
    <rect x="8" y="14" width="24" height="10" rx="2" fill="#3a7fc1"/>
  </svg>

  <!-- ══ EN-TÊTE ══ -->
  <div class="header-row">
    <div class="logo-box">${logoSrc}</div>
    <div class="header-center">
      <div class="univ-name">UNIVERSITE D'ABOMEY CALAVI</div>
      <div class="univ-sub">Vice-Rectorat<br>Chargé des affaires académiques</div>
    </div>
    <div class="logo-box">${logoSrc2}</div>
  </div>

  <hr class="sep">

  <div class="doc-title">ATTESTATION D'INSCRIPTION</div>

  <!-- ══ CORPS ══ -->
  <div class="body-text">

    <p class="full-line">
      Le Vice-Recteur chargé des Affaires Académiques (VR-AA) de l'Université
      d'Abomey-Calavi (UAC)
    </p>

    <p>
      Atteste que le nommé <strong>${nomComplet}</strong> , né(e) le
      <strong>${dateNaissanceFormatee}</strong> à <strong>${lieuNaissance}</strong>,
      est inscrit(e) à l'Université d'Abomey-Calavi (UAC) sous le numéro matricule
      <strong>${etudiantMatricule || "—"}</strong> dans l'entité&nbsp;:
      <strong>${institutionLabel}</strong>, en
      <strong>${filiere}, ${semestresLabel}</strong> au titre de l'année
      académique&nbsp;: <strong>${anneeAcademique}</strong>.
    </p>

    <p class="full-line">
      Cette attestation a été délivrée à l'interessé(e) pour servir et valoir ce que
      de droit.
    </p>

  </div>

  <!-- ══ SIGNATURE ══ -->
  <div class="sig-section">
    <div class="sig-row">

      <!-- QR Code — GAUCHE -->
      <div class="qr-area">${qrSrc}</div>

      <!-- Tampon + Date + Professeur — DROITE -->
      <div class="stamp-area">
        <div class="date-line">Fait à Abomey-Calavi le ${dateGeneration}</div>
        ${buildStampSVG()}
        <div class="prof-name">Professeur Tahirou DJARA</div>
      </div>

    </div>
  </div>

  <!-- ══ PIED DE PAGE ══ -->
  <div class="footer">
    01 BP 526 Cotonou, Bénin &nbsp;/&nbsp; Tél : 01 98 34 04 04 &nbsp;/&nbsp;
    e-mail : vraa.uac@uac.bj &nbsp;/&nbsp; site web : www.uac.bj
  </div>

</div>
</body>
</html>`;
}

// ── Helpers HTML internes ──

/** Génère le SVG du logo UAC (fallback si pas d'image) */
function buildLogoSVG(topArcId, botArcId) {
  return `<svg width="86" height="86" viewBox="0 0 86 86" xmlns="http://www.w3.org/2000/svg">
    <circle cx="43" cy="43" r="41" fill="white" stroke="#7a1515" stroke-width="2.5"/>
    <circle cx="43" cy="43" r="35" fill="none" stroke="#7a1515" stroke-width="1"/>
    <path id="${topArcId}" d="M 8,43 A 35,35 0 0,1 78,43" fill="none"/>
    <text font-size="5.2" font-family="Arial" font-weight="bold" fill="#1a1a1a">
      <textPath href="#${topArcId}" startOffset="3%">UNIVERSITE D'ABOMEY-CALAVI</textPath>
    </text>
    <path id="${botArcId}" d="M 12,50 A 34,34 0 0,0 74,50" fill="none"/>
    <text font-size="5" font-family="Arial" fill="#1a1a1a">
      <textPath href="#${botArcId}" startOffset="18%">BÉNIN</textPath>
    </text>
    <ellipse cx="43" cy="14" rx="5" ry="9" fill="#d44000"/>
    <ellipse cx="43" cy="16" rx="3.5" ry="6.5" fill="#e87c00"/>
    <ellipse cx="43" cy="18" rx="2" ry="4" fill="#f5c518"/>
    <rect x="40.5" y="22" width="5" height="12" rx="1.5" fill="#6b3a1f"/>
    <rect x="39" y="33" width="8" height="2.5" rx="1" fill="#6b3a1f"/>
    <text x="12" y="47" font-size="7" fill="#d4a017">★</text>
    <text x="67" y="47" font-size="7" fill="#d4a017">★</text>
    <path d="M29,38 L43,33 L57,38 L57,57 Q43,65 29,57 Z"
          fill="rgba(26,80,130,0.06)" stroke="#1a5082" stroke-width="1.3"/>
    <text x="43" y="54" text-anchor="middle" font-size="8.5"
          font-weight="bold" font-family="Arial" fill="#1a5082">UAC</text>
  </svg>`;
}

/** Génère le SVG du tampon RECTORAT (fallback si pas d'image) */
function buildStampSVG() {
  return `<svg width="110" height="110" viewBox="0 0 130 130" xmlns="http://www.w3.org/2000/svg">
    <circle cx="65" cy="65" r="60" fill="none" stroke="#b03030" stroke-width="2.8"/>
    <circle cx="65" cy="65" r="53" fill="none" stroke="#b03030" stroke-width="1.5"/>
    <text x="59" y="13" font-size="10" fill="#b03030">★</text>
    <text x="59" y="122" font-size="10" fill="#b03030">★</text>
    <path id="s-top-att" d="M 10,65 A 55,55 0 0,1 120,65" fill="none"/>
    <text font-size="8" font-family="Arial" font-weight="bold" fill="#b03030">
      <textPath href="#s-top-att" startOffset="2%">Université d'Abomey - Calavi</textPath>
    </text>
    <path id="s-bot-att" d="M 16,75 A 51,51 0 0,0 114,75" fill="none"/>
    <text font-size="8" font-family="Arial" font-weight="bold" fill="#b03030">
      <textPath href="#s-bot-att" startOffset="22%">RECTORAT</textPath>
    </text>
    <circle cx="65" cy="62" r="24" fill="rgba(176,48,48,0.05)" stroke="#b03030" stroke-width="0.8"/>
    <rect x="61" y="48" width="8" height="18" rx="2" fill="#b03030" opacity="0.7"/>
    <ellipse cx="65" cy="45" rx="5" ry="8" fill="#b03030" opacity="0.8"/>
    <ellipse cx="65" cy="43" rx="3" ry="5" fill="#d06000" opacity="0.9"/>
    <text x="65" y="76" text-anchor="middle" font-size="8.5" font-family="Arial" fill="#b03030">Le 1er Vice</text>
    <text x="65" y="87" text-anchor="middle" font-size="8.5" font-family="Arial" fill="#b03030">Recteur</text>
    <path d="M 78,95 Q 88,88 100,91 Q 107,93 104,98 Q 100,103 90,99 Q 83,96 85,101"
          fill="none" stroke="#b03030" stroke-width="2" stroke-linecap="round"/>
    <path d="M 82,101 Q 92,97 103,100"
          fill="none" stroke="#b03030" stroke-width="1.3" stroke-linecap="round"/>
  </svg>`;
}

/** Génère le placeholder QR si pas d'image */
function buildQRPlaceholder() {
  return `<svg width="95" height="95" viewBox="0 0 95 95" xmlns="http://www.w3.org/2000/svg">
    <rect width="95" height="95" fill="white"/>
    <rect x="4" y="4" width="28" height="28" fill="black"/>
    <rect x="7" y="7" width="22" height="22" fill="white"/>
    <rect x="10" y="10" width="16" height="16" fill="black"/>
    <rect x="63" y="4" width="28" height="28" fill="black"/>
    <rect x="66" y="7" width="22" height="22" fill="white"/>
    <rect x="69" y="10" width="16" height="16" fill="black"/>
    <rect x="4" y="63" width="28" height="28" fill="black"/>
    <rect x="7" y="66" width="22" height="22" fill="white"/>
    <rect x="10" y="69" width="16" height="16" fill="black"/>
    <rect x="36" y="10" width="4" height="4" fill="black"/>
    <rect x="44" y="10" width="4" height="4" fill="black"/>
    <rect x="52" y="10" width="4" height="4" fill="black"/>
    <rect x="60" y="10" width="4" height="4" fill="black"/>
    <rect x="10" y="36" width="4" height="4" fill="black"/>
    <rect x="10" y="44" width="4" height="4" fill="black"/>
    <rect x="10" y="52" width="4" height="4" fill="black"/>
    <rect x="10" y="60" width="4" height="4" fill="black"/>
    <rect x="36" y="4" width="4" height="4" fill="black"/>
    <rect x="48" y="4" width="4" height="4" fill="black"/>
    <rect x="36" y="18" width="8" height="4" fill="black"/>
    <rect x="52" y="18" width="8" height="4" fill="black"/>
    <rect x="36" y="26" width="4" height="4" fill="black"/>
    <rect x="48" y="26" width="8" height="4" fill="black"/>
    <rect x="18" y="36" width="8" height="4" fill="black"/>
    <rect x="36" y="36" width="8" height="4" fill="black"/>
    <rect x="52" y="36" width="8" height="4" fill="black"/>
    <rect x="68" y="36" width="8" height="4" fill="black"/>
    <rect x="84" y="36" width="4" height="4" fill="black"/>
    <rect x="36" y="44" width="8" height="4" fill="black"/>
    <rect x="52" y="44" width="8" height="4" fill="black"/>
    <rect x="68" y="44" width="8" height="4" fill="black"/>
    <rect x="84" y="44" width="4" height="4" fill="black"/>
    <rect x="36" y="52" width="4" height="4" fill="black"/>
    <rect x="48" y="52" width="8" height="4" fill="black"/>
    <rect x="68" y="52" width="4" height="4" fill="black"/>
    <rect x="80" y="52" width="8" height="4" fill="black"/>
    <rect x="36" y="60" width="8" height="4" fill="black"/>
    <rect x="52" y="60" width="8" height="4" fill="black"/>
    <rect x="68" y="60" width="8" height="4" fill="black"/>
    <rect x="36" y="68" width="8" height="4" fill="black"/>
    <rect x="52" y="68" width="4" height="4" fill="black"/>
    <rect x="68" y="68" width="8" height="4" fill="black"/>
    <rect x="84" y="68" width="4" height="4" fill="black"/>
    <rect x="36" y="76" width="8" height="4" fill="black"/>
    <rect x="52" y="76" width="4" height="4" fill="black"/>
    <rect x="68" y="76" width="8" height="4" fill="black"/>
    <rect x="36" y="84" width="4" height="4" fill="black"/>
    <rect x="48" y="84" width="4" height="4" fill="black"/>
    <rect x="60" y="84" width="8" height="4" fill="black"/>
  </svg>`;
}

/**
 * Construit le libellé des semestres à partir du tableau.
 * Ex: [3, 4] → "Semestres 3 et 4"
 *     [1]    → "Semestre 1"
 */
function buildSemestresLabel(semestres) {
  if (!semestres || semestres.length === 0) return "Semestres 3 et 4";
  if (semestres.length === 1) return `Semestre ${semestres[0]}`;
  const last = semestres[semestres.length - 1];
  const others = semestres.slice(0, -1).join(", ");
  return `Semestres ${others} et ${last}`;
}

// ─────────────────────────────────────────────
// FONCTION EXPORTÉE — ATTESTATION D'INSCRIPTION
// ─────────────────────────────────────────────

/**
 * Génère un PDF d'attestation d'inscription UAC.
 *
 * @param {Object} demande     - Objet Demande depuis Prisma
 * @param {Object} etudiant    - Objet Utilisateur depuis Prisma
 * @param {string} reference   - Référence unique du document (ex: ETD-2026-IFRI-ATT-XXXXX)
 * @param {Object} institution - Objet Institution depuis Prisma
 * @param {string} qrData      - URL encodée dans le QR code
 * @returns {Promise<string>}  - Chemin absolu du PDF généré
 *
 * @example
 * const pdfPath = await pdfService.generateAttestationInscription(
 *   demande, etudiant, reference, institution, qrData
 * );
 */
exports.generateAttestationInscription = async (
    demande,
    etudiant,
    reference,
    institution,
    qrData
) => {
  // ── 1. Assets en parallèle ──
  const [logoUACBase64, qrBase64] = await Promise.all([
    Promise.resolve(getLogoUAC()),
    generateQRDataURL(qrData),
  ]);

  // ── 2. Infos étudiant ──
  const etudiantNom            = etudiant?.nom        || "";
  const etudiantPrenom         = etudiant?.prenom      || "";
  const etudiantDateNaissance  = etudiant?.dateNaissance || null;
  const etudiantLieuNaissance  = etudiant?.lieuNaissance || null;
  const etudiantMatricule      = etudiant?.numeroEtudiant || etudiant?.matricule || "";
  const etudiantFiliere        = etudiant?.filiere     || demande?.filiere || "Licence en Génie Logiciel";

  // Semestres depuis la demande (tableau ou valeur unique)
  const etudiantSemestres = demande?.semestres
      ? (Array.isArray(demande.semestres) ? demande.semestres : [demande.semestres])
      : demande?.semestre
          ? [demande.semestre]
          : [3, 4];

  // ── 3. Infos institution ──
  const institutionNom   = institution?.nom   || "INSTITUT DE FORMATION ET DE RECHERCHE EN INFORMATIQUE";
  const institutionSigle = institution?.sigle || "IFRI";

  // ── 4. Dates ──
  const now = new Date();
  const annee = now.getFullYear();
  const anneeAcademique = `${annee - 1}-${annee}`;
  const dateGeneration = now.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // ── 5. Construire le HTML ──
  const html = buildAttestationInscriptionHtml({
    logoUACBase64,
    etudiantNom,
    etudiantPrenom,
    etudiantDateNaissance,
    etudiantLieuNaissance,
    etudiantMatricule,
    etudiantFiliere,
    etudiantSemestres,
    institutionNom,
    institutionSigle,
    anneeAcademique,
    dateGeneration,
    qrBase64,
  });

  // ── 6. Lancer Puppeteer ──
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
    await page.setContent(html, { waitUntil: "networkidle0" });

    const fileName   = `${reference}.pdf`;
    const outputPath = path.join(OUTPUT_DIR, fileName);

    await page.pdf({
      path: outputPath,
      format: "A4",
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    return outputPath;
  } finally {
    await browser.close();
  }
};