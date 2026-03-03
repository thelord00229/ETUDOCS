/**
 * pdf.service.js
 * Service de génération PDF pour EtuDocs
 * Chemin: backend/src/services/pdf.service.js
 *
 * ✅ Browser Puppeteer singleton
 * ✅ Page par génération (newPage), fermeture page après pdf
 * ✅ Assets images convertis en base64 (pas de requête réseau côté Chromium)
 * ✅ CSS complet intégré dans buildHtml
 * ✅ Timeouts + logs
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

const PDF_TIMEOUT_MS        = Number(process.env.PDF_TIMEOUT_MS         || 60000);
const REMOTE_ASSET_TIMEOUT_MS = Number(process.env.REMOTE_ASSET_TIMEOUT_MS || 8000);
const REMOTE_ASSET_MAX_BYTES  = Number(process.env.REMOTE_ASSET_MAX_BYTES  || 2_500_000);

const PUPPETEER_EXECUTABLE_PATH = process.env.PUPPETEER_EXECUTABLE_PATH || "";

const DEBUG_PDF = String(process.env.DEBUG_PDF || "").toLowerCase() === "true";
const log = (...args) => DEBUG_PDF && console.log("[pdf.service]", ...args);

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// ─────────────────────────────────────────────
// PUPPETEER SINGLETON
// ─────────────────────────────────────────────

let _browserPromise = null;

async function getBrowser() {
  if (_browserPromise) return _browserPromise;
  const launchOptions = {
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  };
  if (PUPPETEER_EXECUTABLE_PATH) {
    launchOptions.executablePath = PUPPETEER_EXECUTABLE_PATH;
  }
  _browserPromise = puppeteer.launch(launchOptions);
  return _browserPromise;
}

async function closeBrowser() {
  try {
    if (_browserPromise) {
      const b = await _browserPromise;
      await b.close();
    }
  } catch (e) {
    // ignore
  } finally {
    _browserPromise = null;
  }
}

process.on("exit",   () => closeBrowser());
process.on("SIGINT",  async () => { await closeBrowser(); process.exit(0); });
process.on("SIGTERM", async () => { await closeBrowser(); process.exit(0); });

// ─────────────────────────────────────────────
// UTILITAIRES ASSETS
// ─────────────────────────────────────────────

function detectMimeFromExt(ext) {
  const e = String(ext || "").toLowerCase().replace(".", "");
  if (e === "jpg" || e === "jpeg") return "image/jpeg";
  if (e === "png")  return "image/png";
  if (e === "webp") return "image/webp";
  if (e === "svg")  return "image/svg+xml";
  return "application/octet-stream";
}

function bufferToDataUrl(buf, mime) {
  if (!buf || !Buffer.isBuffer(buf)) return null;
  return `data:${mime};base64,${buf.toString("base64")}`;
}

function isHttpUrl(s) {
  return typeof s === "string" && (s.startsWith("http://") || s.startsWith("https://"));
}

function fetchRemoteAsDataUrl(url, timeoutMs = REMOTE_ASSET_TIMEOUT_MS) {
  return new Promise((resolve) => {
    try {
      if (!isHttpUrl(url)) return resolve(null);
      const client = url.startsWith("https://") ? https : http;
      const req = client.get(url, { headers: { "User-Agent": "EtuDocs-PDF/1.0", Accept: "image/*,*/*;q=0.8" } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const next = res.headers.location.startsWith("http")
            ? res.headers.location
            : new URL(res.headers.location, url).toString();
          res.resume();
          return resolve(fetchRemoteAsDataUrl(next, timeoutMs));
        }
        if (res.statusCode !== 200) { res.resume(); return resolve(null); }
        const contentType = res.headers["content-type"] || "application/octet-stream";
        const chunks = [];
        let total = 0;
        res.on("data", (chunk) => {
          total += chunk.length;
          if (total > REMOTE_ASSET_MAX_BYTES) { req.destroy(); return resolve(null); }
          chunks.push(chunk);
        });
        res.on("end", () => resolve(bufferToDataUrl(Buffer.concat(chunks), String(contentType).split(";")[0])));
      });
      req.setTimeout(timeoutMs, () => { req.destroy(); resolve(null); });
      req.on("error", () => resolve(null));
    } catch { resolve(null); }
  });
}

async function imageToDataUrl(filePathOrUrl) {
  try {
    if (!filePathOrUrl) return null;
    if (isHttpUrl(filePathOrUrl)) return await fetchRemoteAsDataUrl(filePathOrUrl);
    const abs = path.isAbsolute(filePathOrUrl) ? filePathOrUrl : path.resolve(process.cwd(), filePathOrUrl);
    if (!fs.existsSync(abs)) return null;
    const mime = detectMimeFromExt(path.extname(abs));
    return bufferToDataUrl(fs.readFileSync(abs), mime);
  } catch { return null; }
}

async function getLogoInstitution(institution) {
  if (institution?.logoUrl) {
    const embedded = await imageToDataUrl(institution.logoUrl);
    if (embedded) return embedded;
  }
  const sigle = (institution?.sigle || "IFRI").toUpperCase();
  return imageToDataUrl(path.join(ASSETS_DIR, "logos", `${sigle}.png`));
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
    return await QRCode.toDataURL(text, { width: 80, margin: 1, color: { dark: "#000000", light: "#ffffff" } });
  } catch { return null; }
}

// ─────────────────────────────────────────────
// STRUCTURE UE + NOTES
// ─────────────────────────────────────────────

const UE_STRUCTURES = {
  1: [
    {
      code: "MTH1121", intitule: "LOGIQUE, ARITHMÉTIQUE ET SES APPLICATIONS", credits: 5,
      ecus: [{ code: "1MTH1121", intitule: "Logique, arithmétique et applications" }],
    },
    {
      code: "MTH1122", intitule: "MATHÉMATIQUES FONDAMENTALES", credits: 5,
      ecus: [
        { code: "1MTH1122", intitule: "Algèbre linéaire et applications" },
        { code: "2MTH1122", intitule: "Analyse et applications" },
      ],
    },
    {
      code: "MTH1123", intitule: "PROBABILITÉ ET STATISTIQUE", credits: 5,
      ecus: [
        { code: "1MTH1123", intitule: "Analyse combinatoire, calcul des probabilités et applications" },
        { code: "2MTH1123", intitule: "Statistiques inférentielles et applications" },
      ],
    },
    {
      code: "INF1124", intitule: "ARCHITECTURE ET TOPOLOGIE DES RÉSEAUX INFORMATIQUES", credits: 4,
      ecus: [{ code: "1INF1124", intitule: "Architecture et topologie des réseaux informatiques" }],
    },
    {
      code: "INF1125", intitule: "SYSTÈME D'EXPLOITATION ET OUTILS DE BASE EN INFORMATIQUE", credits: 4,
      ecus: [
        { code: "1INF1125", intitule: "Utilisation et administration sous Windows/Linux" },
        { code: "2INF1125", intitule: "Outils de base en informatique" },
      ],
    },
    {
      code: "INF1126", intitule: "BASE DE LA PROGRAMMATION", credits: 4,
      ecus: [
        { code: "1INF1126", intitule: "Algorithmique" },
        { code: "2INF1126", intitule: "Langages C" },
      ],
    },
    {
      code: "DRP1127", intitule: "DÉONTOLOGIE ET DROIT LIÉS AUX TIC", credits: 2,
      ecus: [{ code: "1DRP1127", intitule: "Déontologie et droit liés aux TIC" }],
    },
    {
      code: "TCC1128", intitule: "TECHNIQUES D'EXPRESSION ÉCRITE ET ORALE", credits: 1,
      ecus: [{ code: "1TCC1128", intitule: "Techniques d'expression écrite et orale" }],
    },
  ],
  2: [
    {
      code: "MTH1221", intitule: "ALGÈBRE LINÉAIRE AVANCÉE", credits: 5,
      ecus: [
        { code: "1MTH1221", intitule: "Espaces vectoriels et applications linéaires" },
        { code: "2MTH1221", intitule: "Matrices et déterminants" },
      ],
    },
    {
      code: "INF1222", intitule: "PROGRAMMATION ORIENTÉE OBJET", credits: 5,
      ecus: [
        { code: "1INF1222", intitule: "Concepts POO et Java" },
        { code: "2INF1222", intitule: "Structures de données et algorithmes avancés" },
      ],
    },
    {
      code: "INF1223", intitule: "BASE DE DONNÉES", credits: 4,
      ecus: [
        { code: "1INF1223", intitule: "Modélisation et conception de BDD" },
        { code: "2INF1223", intitule: "SQL et administration" },
      ],
    },
    {
      code: "INF1224", intitule: "SYSTÈMES D'INFORMATION", credits: 4,
      ecus: [
        { code: "1INF1224", intitule: "Analyse et conception des SI" },
        { code: "2INF1224", intitule: "UML et méthodes agiles" },
      ],
    },
    {
      code: "INF1225", intitule: "RÉSEAUX INFORMATIQUES", credits: 4,
      ecus: [
        { code: "1INF1225", intitule: "Protocoles réseau TCP/IP" },
        { code: "2INF1225", intitule: "Administration réseau" },
      ],
    },
    {
      code: "DRP1226", intitule: "DROIT DU NUMÉRIQUE", credits: 2,
      ecus: [{ code: "1DRP1226", intitule: "Cybercriminalité et protection des données" }],
    },
    {
      code: "TCC1227", intitule: "COMMUNICATION PROFESSIONNELLE", credits: 1,
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
  if (note >= 9)  return "C−";
  if (note >= 8)  return "D+";
  if (note >= 5)  return "D";
  return "F";
}

function generateRandomNotes(semestre) {
  const ues = UE_STRUCTURES[semestre] || UE_STRUCTURES[1];
  const anneeActuelle = new Date().getFullYear();

  let totalCredits = 0;
  let totalCreditsValides = 0;
  let sommePonderee = 0;

  const rows = ues.map((ue) => {
    const ecuNotes = ue.ecus.map((ecu) => ({ ...ecu, note: randNote(7, 19) }));
    const moyUE = Math.round((ecuNotes.reduce((s, e) => s + e.note, 0) / ecuNotes.length) * 100) / 100;
    const valide = moyUE >= 10;
    const sessionValidation = valide
      ? `VALIDE EN Févr ${anneeActuelle}`
      : `NON VALIDE — Sept ${anneeActuelle}`;

    totalCredits += ue.credits;
    if (valide) totalCreditsValides += ue.credits;
    sommePonderee += moyUE * ue.credits;

    return { ...ue, moyUE, cote: getCote(moyUE), valide, sessionValidation, ecus: ecuNotes };
  });

  const moyenneSemestrielle   = Math.round((sommePonderee / totalCredits) * 100) / 100;
  const creditsCapitalises    = Math.round((totalCreditsValides / totalCredits) * 10000) / 100;
  const decision              = moyenneSemestrielle >= 10 ? "Continue" : "Redouble";

  return { rows, moyenneSemestrielle, creditsCapitalises, decision, totalCredits };
}

// ─────────────────────────────────────────────
// TEMPLATE HTML — RELEVÉ DE NOTES
// ─────────────────────────────────────────────

function buildHtml(payload) {
  const {
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
  } = payload;

  const { rows, moyenneSemestrielle, creditsCapitalises, decision } = notes;

  const semestreLabel =
    semestre === 1 ? "Premier"   :
    semestre === 2 ? "Deuxième"  :
    semestre === 3 ? "Troisième" :
    semestre === 4 ? "Quatrième" :
    semestre === 5 ? "Cinquième" : "Sixième";

  /* ── Lignes du tableau ── */
  const tableRows = rows.map((ue) => `
    <tr class="row-ue">
      <td class="cell-code">${ue.code}</td>
      <td class="cell-intitule">${ue.intitule}</td>
      <td class="cell-num">${ue.credits}</td>
      <td class="cell-num">${ue.moyUE.toFixed(2)}/20</td>
      <td class="cell-cote">${ue.cote}</td>
      <td class="cell-result">${ue.sessionValidation}</td>
    </tr>
    ${ue.ecus.map((ecu) => `
    <tr class="row-ecu">
      <td class="cell-code-ecu">${ecu.code}</td>
      <td class="cell-intitule ecu-indent">${ecu.intitule}</td>
      <td class="cell-empty"></td>
      <td class="cell-num-ecu">${ecu.note.toFixed(2)}/20</td>
      <td class="cell-empty"></td>
      <td class="cell-empty"></td>
    </tr>`).join("")}
  `).join("");

  /* ── Logos & tampons ── */
  const logoUACSrc = logoUACBase64
    ? `<img src="${logoUACBase64}" class="logo-uac" alt="UAC"/>`
    : `<div class="logo-placeholder">UAC</div>`;

  const logoInstSrc = logoInstitutionBase64
    ? `<img src="${logoInstitutionBase64}" class="logo-ifri" alt="${institutionSigle}"/>`
    : `<div class="logo-inst-text">${institutionSigle || "IFRI"}</div>`;

  const tamponDASrc = tamponDABase64
    ? `<img src="${tamponDABase64}" class="stamp-img" alt="Tampon DA"/>`
    : `<div class="stamp-placeholder">Tampon<br/>Dir. Adjoint</div>`;

  const tamponDIRSrc = tamponDIRBase64
    ? `<img src="${tamponDIRBase64}" class="stamp-img" alt="Tampon DIR"/>`
    : `<div class="stamp-placeholder">Tampon<br/>Directeur</div>`;

  const qrSrc = qrBase64
    ? `<img src="${qrBase64}" class="qr-img" alt="QR Code"/>`
    : `<div class="qr-placeholder">QR<br/>Code</div>`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>

/* ═══════════════════════════════════════
   RESET & BASE
═══════════════════════════════════════ */
* { margin: 0; padding: 0; box-sizing: border-box; }

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
  padding: 5mm 7mm 4mm 7mm;
  background: #ffc8c8;
}

/* ═══════════════════════════════════════
   EN-TÊTE
═══════════════════════════════════════ */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2mm;
}

.logo-uac {
  width: 23mm;
  height: 23mm;
  object-fit: contain;
  flex-shrink: 0;
}

.logo-ifri {
  width: 20mm;
  height: 20mm;
  object-fit: contain;
  flex-shrink: 0;
}

.logo-placeholder {
  width: 23mm;
  height: 23mm;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8pt;
  border: 1px solid #999;
  flex-shrink: 0;
}

.logo-inst-text {
  width: 20mm;
  height: 20mm;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9pt;
  font-weight: bold;
  border: 1px solid #999;
  flex-shrink: 0;
}

.header-center {
  flex: 1;
  text-align: center;
  padding: 0 3mm;
}

.univ-name {
  font-size: 13pt;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.ifri-name {
  font-size: 9pt;
  font-weight: bold;
  text-transform: uppercase;
  margin-top: 1mm;
  line-height: 1.3;
}

.header-sep {
  border: none;
  border-top: 1.5px solid #333;
  margin: 1.5mm 8mm;
}

.header-addr {
  font-size: 7.5pt;
  margin-top: 1mm;
}

.header-web {
  font-size: 7pt;
  margin-top: 0.5mm;
  color: #222;
}

/* ═══════════════════════════════════════
   NUMÉRO DU DOCUMENT
═══════════════════════════════════════ */
.doc-number-line {
  text-align: center;
  font-size: 8pt;
  margin: 2mm 0 1.5mm 0;
  font-style: italic;
}

.doc-ref {
  display: inline-block;
  font-weight: bold;
  font-style: normal;
  letter-spacing: 0.5px;
  border: 1px solid #555;
  padding: 0.3mm 2.5mm;
  font-size: 8.5pt;
  font-family: 'Courier New', monospace;
}

/* ═══════════════════════════════════════
   BLOC ÉTUDIANT
═══════════════════════════════════════ */
.student-block {
  display: flex;
  align-items: flex-start;
  gap: 3mm;
  margin: 1.5mm 0;
  padding: 2mm 2.5mm;
  background: rgba(255,255,255,0.25);
  border: 1px solid rgba(0,0,0,0.15);
}

.qr-box {
  width: 20mm;
  height: 20mm;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.qr-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 6pt;
  color: #666;
  text-align: center;
  border: 1px solid #aaa;
}

.info-table {
  flex: 1;
}

.info-row {
  display: flex;
  align-items: baseline;
  margin-bottom: 0.9mm;
  font-size: 8pt;
  line-height: 1.3;
}

.info-lbl {
  width: 46mm;
  flex-shrink: 0;
  color: #222;
}

.info-sep {
  width: 5mm;
  text-align: center;
  flex-shrink: 0;
}

.info-val {
  flex: 1;
  color: #111;
}

.info-val.bold {
  font-weight: bold;
}

.photo-box {
  width: 22mm;
  height: 28mm;
  border: 1px solid #888;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 7pt;
  text-align: center;
  color: #666;
  flex-shrink: 0;
  background: rgba(255,255,255,0.4);
}

/* ═══════════════════════════════════════
   TITRE DU RELEVÉ
═══════════════════════════════════════ */
.releve-title {
  text-align: center;
  font-size: 10.5pt;
  font-weight: bold;
  font-style: italic;
  text-decoration: underline;
  margin: 2.5mm 0 1.5mm 0;
  letter-spacing: 0.3px;
}

/* ═══════════════════════════════════════
   TABLEAU DES NOTES
═══════════════════════════════════════ */
.notes {
  width: 100%;
  border-collapse: collapse;
  font-size: 7.5pt;
}

.notes thead tr {
  background-color: #1a3a5c;
  color: #ffffff;
}

.notes thead th {
  padding: 1.8mm 1mm;
  text-align: center;
  font-weight: bold;
  border: 0.5px solid #4a6a8c;
  font-size: 7.5pt;
  line-height: 1.2;
}

/* Lignes UE */
.row-ue td {
  background-color: #b8cce4;
  font-weight: bold;
  padding: 1.2mm 1.2mm;
  border: 0.5px solid #7a9ec0;
  font-size: 7.5pt;
  line-height: 1.2;
}

/* Lignes ECU */
.row-ecu td {
  background-color: #dce6f1;
  font-weight: normal;
  padding: 0.9mm 1.2mm;
  border: 0.5px solid #aac4e0;
  font-size: 7.2pt;
  line-height: 1.2;
}

.cell-code {
  text-align: center;
  width: 11%;
  font-size: 7pt;
}

.cell-code-ecu {
  text-align: center;
  width: 11%;
  font-size: 7pt;
  background-color: #dce6f1;
  border: 0.5px solid #aac4e0;
  padding: 0.9mm 1.2mm;
}

.cell-intitule { text-align: left; width: 37%; }

.ecu-indent {
  padding-left: 6mm !important;
  font-style: italic;
}

.cell-num      { text-align: center; width: 9%;  }
.cell-cote     { text-align: center; width: 7%; font-weight: bold; }
.cell-result   { text-align: center; width: 26%; font-size: 7pt; }

.cell-num-ecu {
  text-align: center;
  width: 9%;
  background-color: #dce6f1;
  border: 0.5px solid #aac4e0;
  padding: 0.9mm 1.2mm;
}

.cell-empty {
  background-color: #dce6f1;
  border: 0.5px solid #aac4e0;
}

/* ═══════════════════════════════════════
   BARRE RÉCAPITULATIVE
═══════════════════════════════════════ */
.summary-bar {
  display: flex;
  background-color: #1a3a5c;
  color: #ffffff;
  padding: 2mm 3mm;
  justify-content: space-around;
  align-items: center;
}

.sum-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.5mm;
}

.sum-label { font-size: 6.8pt; opacity: 0.9; }
.sum-val   { font-size: 9pt; font-weight: bold; }

/* ═══════════════════════════════════════
   LÉGENDE
═══════════════════════════════════════ */
.legend {
  font-size: 5.5pt;
  color: #333;
  margin-top: 1.5mm;
  line-height: 1.5;
  text-align: justify;
  font-family: Arial, sans-serif;
}

/* ═══════════════════════════════════════
   DATE
═══════════════════════════════════════ */
.date-line {
  text-align: right;
  font-size: 8pt;
  margin: 2mm 0 1mm 0;
  font-style: italic;
}

.date-val { font-weight: bold; font-style: normal; }

/* ═══════════════════════════════════════
   SIGNATURES
═══════════════════════════════════════ */
.signatures {
  display: flex;
  justify-content: space-around;
  align-items: flex-start;
  margin-top: 1mm;
}

.sig-block {
  text-align: center;
  width: 45%;
}

.sig-title {
  font-size: 8.5pt;
  font-weight: bold;
  font-family: 'Times New Roman', serif;
}

.sig-subtitle {
  font-size: 7.5pt;
  font-style: italic;
  color: #444;
  margin-bottom: 1mm;
  min-height: 4mm;
}

.sig-zone {
  width: 32mm;
  height: 32mm;
  margin: 1mm auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stamp-img {
  width: 32mm;
  height: 32mm;
  object-fit: contain;
}

.stamp-placeholder {
  width: 32mm;
  height: 32mm;
  border: 1px dashed #999;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 7pt;
  color: #888;
  text-align: center;
}

.sig-name {
  font-size: 8pt;
  font-weight: bold;
  margin-top: 0.5mm;
}

</style>
</head>
<body>
<div class="page">

  <!-- EN-TÊTE -->
  <div class="header">
    ${logoUACSrc}
    <div class="header-center">
      <div class="univ-name">Université d'Abomey-Calavi</div>
      <div class="ifri-name">${institutionNom || "Institut de Formation et de Recherche en Informatique"}</div>
      <hr class="header-sep">
      <div class="header-addr">BP: 526 COTONOU &nbsp;—&nbsp; TÉL : (+229) 55-028-070</div>
      <div class="header-web">Site web : https://www.ifri-uac.bj &nbsp;—&nbsp; Courriel : contact@ifri.uac.bj</div>
    </div>
    ${logoInstSrc}
  </div>

  <!-- NUMÉRO DOCUMENT -->
  <div class="doc-number-line">
    <span style="font-style:italic;">N°&nbsp;</span>
    <span class="doc-ref">${reference}</span>
  </div>

  <!-- BLOC ÉTUDIANT -->
  <div class="student-block">
    <div class="qr-box">${qrSrc}</div>

    <div class="info-table">
      <div class="info-row">
        <span class="info-lbl">Année académique</span><span class="info-sep">:</span>
        <span class="info-val">${anneeAcademique}</span>
      </div>
      <div class="info-row">
        <span class="info-lbl">Domaine</span><span class="info-sep">:</span>
        <span class="info-val">Sciences et Technologies</span>
      </div>
      <div class="info-row">
        <span class="info-lbl">Grade</span><span class="info-sep">:</span>
        <span class="info-val">Licence</span>
      </div>
      <div class="info-row">
        <span class="info-lbl">Mention</span><span class="info-sep">:</span>
        <span class="info-val">Informatique</span>
      </div>
      <div class="info-row">
        <span class="info-lbl">Spécialité</span><span class="info-sep">:</span>
        <span class="info-val">${etudiantFiliere || "—"}</span>
      </div>
      <div class="info-row">
        <span class="info-lbl">Nom et Prénoms</span><span class="info-sep">:</span>
        <span class="info-val bold">${etudiantNom} ${etudiantPrenom}</span>
      </div>
      <div class="info-row">
        <span class="info-lbl">Sexe</span><span class="info-sep">:</span>
        <span class="info-val">—</span>
      </div>
      <div class="info-row">
        <span class="info-lbl">Date et lieu de naissance</span><span class="info-sep">:</span>
        <span class="info-val">—</span>
      </div>
      <div class="info-row">
        <span class="info-lbl">Numéro matricule</span><span class="info-sep">:</span>
        <span class="info-val">${etudiantMatricule || "—"}</span>
      </div>
    </div>

    <div class="photo-box">Photo<br/>étudiant</div>
  </div>

  <!-- TITRE RELEVÉ -->
  <div class="releve-title">Relevé de notes du ${semestreLabel} semestre</div>

  <!-- TABLEAU DES NOTES -->
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

  <!-- BARRE RÉCAPITULATIVE -->
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

  <!-- LÉGENDE -->
  <div class="legend">
    (UE = Unité d'Enseignement) et (ECU = Élément Constitutif d'Unité d'Enseignement)
    (Moyenne semestrielle pondérée = Somme(moyenne UE &times; crédit UE) / Somme crédits UE)
    (Crédits capitalisés — Semestre ${semestre})<br/>
    |16,20|&rArr;A+ &nbsp;/&nbsp; 16&rArr;A &nbsp;/&nbsp; |15,16|&rArr;A&minus; &nbsp;/&nbsp;
    14&rArr;B+ &nbsp;/&nbsp; |13,14|&rArr;B&minus; &nbsp;/&nbsp; |12,13|&rArr;C+ &nbsp;/&nbsp;
    12&rArr;C &nbsp;/&nbsp; |11,12|&rArr;C&minus; &nbsp;/&nbsp; |10,11|&rArr;D+ &nbsp;/&nbsp;
    |05,10|&rArr;D &nbsp;/&nbsp; |00,05|&rArr;F &nbsp;/&nbsp;
    00&rArr;N/A &nbsp;&mdash;&nbsp; Si nombre de 0 &gt; 5 &rArr; N (Abandon)
  </div>

  <!-- DATE -->
  <div class="date-line">
    Abomey-Calavi, le&nbsp;<span class="date-val">${dateGeneration}</span>
  </div>

  <!-- SIGNATURES -->
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
// MAIN — GÉNÉRATION RELEVÉ DE NOTES
// ─────────────────────────────────────────────

exports.generateDocument = async (demande, etudiant, notesData, reference, institution, qrData) => {
  const [logoUACBase64, logoInstitutionBase64, tamponDABase64, tamponDIRBase64, qrBase64] =
    await Promise.all([
      getLogoUAC(),
      getLogoInstitution(institution),
      getTamponDA(institution),
      getTamponDIR(institution),
      generateQRDataURL(qrData),
    ]);

  const etudiantNom      = (etudiant?.nom    || "").toUpperCase();
  const etudiantPrenom   =  etudiant?.prenom || "";
  const etudiantMatricule = etudiant?.numeroEtudiant || "";
  const etudiantFiliere  =  etudiant?.filiere || "";
  const etudiantNiveau   =  etudiant?.niveau  || "";

  const institutionNom          = institution?.nom                || "";
  const institutionSigle        = institution?.sigle              || "IFRI";
  const directeurNom            = institution?.directeurNom       || "";
  const directeurTitre          = institution?.directeurTitre     || "";
  const directeurAdjointNom     = institution?.directeurAdjointNom   || "";
  const directeurAdjointTitre   = institution?.directeurAdjointTitre || "";

  const semestre = demande?.semestre || demande?.semestres?.[0] || 1;
  const now = new Date();
  const annee = now.getFullYear();
  const anneeAcademique = `${annee - 1}-${annee}`;
  const dateGeneration  = now.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });

  const notes = generateRandomNotes(semestre);

  const html = buildHtml({
    logoUACBase64, logoInstitutionBase64,
    institutionNom, institutionSigle,
    directeurNom, directeurTitre,
    directeurAdjointNom, directeurAdjointTitre,
    tamponDABase64, tamponDIRBase64,
    etudiantNom, etudiantPrenom, etudiantMatricule, etudiantFiliere, etudiantNiveau,
    reference, semestre, anneeAcademique, notes, qrBase64, dateGeneration,
  });

  const browser = await getBrowser();
  let page = null;

  try {
    page = await browser.newPage();
    page.setDefaultNavigationTimeout(PDF_TIMEOUT_MS);
    page.setDefaultTimeout(PDF_TIMEOUT_MS);

    await page.setContent(html, { waitUntil: "domcontentloaded", timeout: PDF_TIMEOUT_MS });
    await sleep(120);

    const fileName   = `${reference}.pdf`;
    const outputPath = path.join(OUTPUT_DIR, fileName);

    log("Generating PDF:", outputPath);

    await page.pdf({
      path: outputPath,
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      scale: 0.95,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      timeout: PDF_TIMEOUT_MS,
    });

    return outputPath;
  } catch (e) {
    const msg = e?.message || "Erreur génération PDF";
    log("PDF error:", msg);
    const err = new Error(`PDF_GENERATION_FAILED: ${msg}`);
    err.statusCode = 500;
    throw err;
  } finally {
    if (page) { try { await page.close(); } catch {} }
  }
};

// ─────────────────────────────────────────────
// TEMPLATE HTML — ATTESTATION D'INSCRIPTION
// ─────────────────────────────────────────────

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
  const logoSrc = logoUACBase64
    ? `<img src="${logoUACBase64}" style="width:86px;height:86px;object-fit:contain;" alt="UAC"/>`
    : buildLogoSVG("top-arc-L", "bot-arc-L");

  const logoSrc2 = logoUACBase64
    ? `<img src="${logoUACBase64}" style="width:86px;height:86px;object-fit:contain;" alt="UAC"/>`
    : buildLogoSVG("top-arc-R", "bot-arc-R");

  const qrSrc = qrBase64
    ? `<img src="${qrBase64}" style="width:95px;height:95px;" alt="QR Code"/>`
    : buildQRPlaceholder();

  const nomComplet = `${(etudiantNom || "").toUpperCase()} ${etudiantPrenom || ""}`.trim();

  const dateNaissanceFormatee = etudiantDateNaissance
    ? new Date(etudiantDateNaissance).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : "—";

  const lieuNaissance  = etudiantLieuNaissance || "—";
  const semestresLabel = buildSemestresLabel(etudiantSemestres);
  const filiere        = etudiantFiliere || "Informatique";

  const institutionLabel = institutionNom
    ? `${institutionNom}${institutionSigle ? ` (${institutionSigle})` : ""}`
    : "INSTITUT DE FORMATION ET DE RECHERCHE EN INFORMATIQUE (IFRI)";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
html, body { width:210mm; font-family:'Times New Roman',Times,serif; color:#111; font-size:10pt; }

.page {
  width: 210mm;
  min-height: 297mm;
  padding: 12mm 15mm 10mm 15mm;
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 3mm;
}

.logo-box {
  width: 86px;
  height: 86px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.header-center {
  flex: 1;
  text-align: center;
  padding: 0 5mm;
}

.univ-name {
  font-size: 13pt;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.univ-sub {
  font-size: 9.5pt;
  margin-top: 2mm;
  line-height: 1.4;
}

.sep {
  border: none;
  border-top: 2px solid #333;
  margin: 3mm 0;
}

.doc-title {
  text-align: center;
  font-size: 14pt;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 5mm 0 6mm 0;
  text-decoration: underline;
}

.body-text {
  font-size: 10.5pt;
  line-height: 1.8;
}

.body-text p {
  margin-bottom: 4mm;
  text-align: justify;
}

.body-text .full-line {
  text-align: left;
}

.sig-section {
  margin-top: 8mm;
}

.sig-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10mm;
}

.qr-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2mm;
}

.stamp-area {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2mm;
}

.date-line {
  font-size: 10pt;
  font-style: italic;
  margin-bottom: 2mm;
}

.prof-name {
  font-size: 9.5pt;
  font-weight: bold;
  margin-top: 2mm;
}

.footer {
  position: fixed;
  bottom: 8mm;
  left: 15mm;
  right: 15mm;
  text-align: center;
  font-size: 8pt;
  color: #555;
  border-top: 1px solid #ccc;
  padding-top: 2mm;
}
</style>
</head>
<body>
<div class="page">

  <div class="header-row">
    <div class="logo-box">${logoSrc}</div>
    <div class="header-center">
      <div class="univ-name">UNIVERSITE D'ABOMEY CALAVI</div>
      <div class="univ-sub">Vice-Rectorat<br/>Chargé des affaires académiques</div>
    </div>
    <div class="logo-box">${logoSrc2}</div>
  </div>

  <hr class="sep">

  <div class="doc-title">ATTESTATION D'INSCRIPTION</div>

  <div class="body-text">
    <p class="full-line">
      Le Vice-Recteur chargé des Affaires Académiques (VR-AA) de l'Université
      d'Abomey-Calavi (UAC)
    </p>
    <p>
      Atteste que le nommé <strong>${nomComplet}</strong>, né(e) le
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

  <div class="sig-section">
    <div class="sig-row">
      <div class="qr-area">${qrSrc}</div>
      <div class="stamp-area">
        <div class="date-line">Fait à Abomey-Calavi le ${dateGeneration}</div>
        ${buildStampSVG()}
        <div class="prof-name">Professeur Tahirou DJARA</div>
      </div>
    </div>
  </div>

  <div class="footer">
    01 BP 526 Cotonou, Bénin &nbsp;/&nbsp; Tél : 01 98 34 04 04 &nbsp;/&nbsp;
    e-mail : vraa.uac@uac.bj &nbsp;/&nbsp; site web : www.uac.bj
  </div>

</div>
</body>
</html>`;
}

// ── Helpers HTML internes ──

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
    <text x="12" y="47" font-size="7" fill="#d4a017">&#9733;</text>
    <text x="67" y="47" font-size="7" fill="#d4a017">&#9733;</text>
    <path d="M29,38 L43,33 L57,38 L57,57 Q43,65 29,57 Z"
          fill="rgba(26,80,130,0.06)" stroke="#1a5082" stroke-width="1.3"/>
    <text x="43" y="54" text-anchor="middle" font-size="8.5"
          font-weight="bold" font-family="Arial" fill="#1a5082">UAC</text>
  </svg>`;
}

function buildStampSVG() {
  return `<svg width="110" height="110" viewBox="0 0 130 130" xmlns="http://www.w3.org/2000/svg">
    <circle cx="65" cy="65" r="60" fill="none" stroke="#b03030" stroke-width="2.8"/>
    <circle cx="65" cy="65" r="53" fill="none" stroke="#b03030" stroke-width="1.5"/>
    <text x="59" y="13" font-size="10" fill="#b03030">&#9733;</text>
    <text x="59" y="122" font-size="10" fill="#b03030">&#9733;</text>
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

function buildQRPlaceholder() {
  return `<svg width="95" height="95" viewBox="0 0 95 95" xmlns="http://www.w3.org/2000/svg">
    <rect width="95" height="95" fill="white"/>
    <rect x="4"  y="4"  width="28" height="28" fill="black"/>
    <rect x="7"  y="7"  width="22" height="22" fill="white"/>
    <rect x="10" y="10" width="16" height="16" fill="black"/>
    <rect x="63" y="4"  width="28" height="28" fill="black"/>
    <rect x="66" y="7"  width="22" height="22" fill="white"/>
    <rect x="69" y="10" width="16" height="16" fill="black"/>
    <rect x="4"  y="63" width="28" height="28" fill="black"/>
    <rect x="7"  y="66" width="22" height="22" fill="white"/>
    <rect x="10" y="69" width="16" height="16" fill="black"/>
  </svg>`;
}

function buildSemestresLabel(semestres) {
  if (!semestres || semestres.length === 0) return "Semestres 3 et 4";
  if (semestres.length === 1) return `Semestre ${semestres[0]}`;
  const last   = semestres[semestres.length - 1];
  const others = semestres.slice(0, -1).join(", ");
  return `Semestres ${others} et ${last}`;
}

// ─────────────────────────────────────────────
// ATTESTATION — EXPORT
// ─────────────────────────────────────────────

exports.generateAttestationInscription = async (demande, etudiant, reference, institution, qrData) => {
  const [logoUACBase64, qrBase64] = await Promise.all([
    getLogoUAC(),
    generateQRDataURL(qrData),
  ]);

  const etudiantNom           =  etudiant?.nom            || "";
  const etudiantPrenom        =  etudiant?.prenom         || "";
  const etudiantDateNaissance =  etudiant?.dateNaissance  || null;
  const etudiantLieuNaissance =  etudiant?.lieuNaissance  || null;
  const etudiantMatricule     =  etudiant?.numeroEtudiant || etudiant?.matricule || "";
  const etudiantFiliere       =  etudiant?.filiere || demande?.filiere || "Licence en Génie Logiciel";

  const etudiantSemestres = demande?.semestres
    ? Array.isArray(demande.semestres) ? demande.semestres : [demande.semestres]
    : demande?.semestre
      ? [demande.semestre]
      : [3, 4];

  const institutionNom   = institution?.nom   || "INSTITUT DE FORMATION ET DE RECHERCHE EN INFORMATIQUE";
  const institutionSigle = institution?.sigle || "IFRI";

  const now = new Date();
  const annee = now.getFullYear();
  const anneeAcademique = `${annee - 1}-${annee}`;
  const dateGeneration  = now.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  const html = buildAttestationInscriptionHtml({
    logoUACBase64,
    etudiantNom, etudiantPrenom, etudiantDateNaissance, etudiantLieuNaissance,
    etudiantMatricule, etudiantFiliere, etudiantSemestres,
    institutionNom, institutionSigle,
    anneeAcademique, dateGeneration, qrBase64,
  });

  const browser = await getBrowser();
  let page = null;

  try {
    page = await browser.newPage();
    page.setDefaultNavigationTimeout(PDF_TIMEOUT_MS);
    page.setDefaultTimeout(PDF_TIMEOUT_MS);

    await page.setContent(html, { waitUntil: "domcontentloaded", timeout: PDF_TIMEOUT_MS });
    await sleep(120);

    const fileName   = `${reference}.pdf`;
    const outputPath = path.join(OUTPUT_DIR, fileName);

    await page.pdf({
      path: outputPath,
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      scale: 0.98,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      timeout: PDF_TIMEOUT_MS,
    });

    return outputPath;
  } catch (e) {
    const msg = e?.message || "Erreur génération PDF";
    const err = new Error(`PDF_GENERATION_FAILED: ${msg}`);
    err.statusCode = 500;
    throw err;
  } finally {
    if (page) { try { await page.close(); } catch {} }
  }
};