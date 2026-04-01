/**
 * pdf.service.js
 * Service de génération PDF pour EtuDocs
 * Chemin: backend/src/services/pdf.service.js
 */

const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
const QRCode = require("qrcode");
const http = require("http");
const https = require("https");

const { buildHtml } = require("./templates/bulletin.template");
const { getInstitutionConfig } = require("./templates/index");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────

const ASSETS_DIR = path.resolve(__dirname, "../assets");
const OUTPUT_DIR = path.resolve(process.cwd(), "uploads", "pdfs");

const PDF_TIMEOUT_MS          = Number(process.env.PDF_TIMEOUT_MS          || 60000);
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
  } catch {}
  finally { _browserPromise = null; }
}

process.on("exit",    () => closeBrowser());
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
      const req = client.get(
        url,
        { headers: { "User-Agent": "EtuDocs-PDF/1.0", Accept: "image/*,*/*;q=0.8" } },
        (res) => {
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
          res.on("end", () =>
            resolve(bufferToDataUrl(Buffer.concat(chunks), String(contentType).split(";")[0]))
          );
        }
      );
      req.setTimeout(timeoutMs, () => { req.destroy(); resolve(null); });
      req.on("error", () => resolve(null));
    } catch { resolve(null); }
  });
}

async function imageToDataUrl(filePathOrUrl) {
  try {
    if (!filePathOrUrl) return null;
    if (isHttpUrl(filePathOrUrl)) return await fetchRemoteAsDataUrl(filePathOrUrl);
    const abs = path.isAbsolute(filePathOrUrl)
      ? filePathOrUrl
      : path.resolve(process.cwd(), filePathOrUrl);
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
    return await QRCode.toDataURL(text, {
      width: 80, margin: 1,
      color: { dark: "#000000", light: "#ffffff" },
    });
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
    const moyUE = Math.round(
      (ecuNotes.reduce((s, e) => s + e.note, 0) / ecuNotes.length) * 100
    ) / 100;
    const valide = moyUE >= 10;
    const sessionValidation = valide
      ? `VALIDE EN Févr ${anneeActuelle}`
      : `NON VALIDE — Sept ${anneeActuelle}`;

    totalCredits += ue.credits;
    if (valide) totalCreditsValides += ue.credits;
    sommePonderee += moyUE * ue.credits;

    return { ...ue, moyUE, cote: getCote(moyUE), valide, sessionValidation, ecus: ecuNotes };
  });

  const moyenneSemestrielle = Math.round((sommePonderee / totalCredits) * 100) / 100;
  const creditsCapitalises  = Math.round((totalCreditsValides / totalCredits) * 10000) / 100;
  const decision            = moyenneSemestrielle >= 10 ? "Continue" : "Redouble";

  return { rows, moyenneSemestrielle, creditsCapitalises, decision, totalCredits };
}

// ─────────────────────────────────────────────
// GÉNÉRATION RELEVÉ DE NOTES
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

  const etudiantNom         = (etudiant?.nom    || "").toUpperCase();
  const etudiantPrenom      =  etudiant?.prenom || "";
  const etudiantMatricule   =  etudiant?.numeroEtudiant || "";
  const etudiantFiliere     =  etudiant?.filiere || "";
  const etudiantNiveau      =  etudiant?.niveau  || "";

  const institutionNom        = institution?.nom                   || "";
  const institutionSigle      = institution?.sigle                 || "IFRI";
  const directeurNom          = institution?.directeurNom          || "";
  const directeurTitre        = institution?.directeurTitre        || "";
  const directeurAdjointNom   = institution?.directeurAdjointNom   || "";
  const directeurAdjointTitre = institution?.directeurAdjointTitre || "";

  const semestre        = demande?.semestre || demande?.semestres?.[0] || 1;
  const now             = new Date();
  const annee           = now.getFullYear();
  const anneeAcademique = `${annee - 1}-${annee}`;
  const dateGeneration  = now.toLocaleDateString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });

  const notes = generateRandomNotes(semestre);

  // ✅ Config dynamique selon l'institution
  const instConfig = getInstitutionConfig(institutionSigle);

  const html = buildHtml({
    logoUACBase64, logoInstitutionBase64,
    institutionNom, institutionSigle,
    directeurNom, directeurTitre,
    directeurAdjointNom, directeurAdjointTitre,
    tamponDABase64, tamponDIRBase64,
    etudiantNom, etudiantPrenom, etudiantMatricule, etudiantFiliere, etudiantNiveau,
    reference, semestre, anneeAcademique, notes, qrBase64, dateGeneration,
    // Infos institution dynamiques
    domaine: instConfig.domaine,
    grade:   instConfig.grade,
    mention: instConfig.mention,
    adresse: instConfig.adresse,
    siteWeb: instConfig.siteWeb,
    email:   instConfig.email,
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
// HELPERS ATTESTATION
// ─────────────────────────────────────────────

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
// GÉNÉRATION ATTESTATION D'INSCRIPTION
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

  const now             = new Date();
  const annee           = now.getFullYear();
  const anneeAcademique = `${annee - 1}-${annee}`;
  const dateGeneration  = now.toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });

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

// ─────────────────────────────────────────────
// TEMPLATE ATTESTATION (interne)
// ─────────────────────────────────────────────

function buildAttestationInscriptionHtml({
  logoUACBase64,
  etudiantNom, etudiantPrenom,
  etudiantDateNaissance, etudiantLieuNaissance,
  etudiantMatricule, etudiantFiliere, etudiantSemestres,
  institutionNom, institutionSigle,
  anneeAcademique, dateGeneration, qrBase64,
}) {
  const logoSrc  = logoUACBase64
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
    ? new Date(etudiantDateNaissance).toLocaleDateString("fr-FR", {
        day: "numeric", month: "long", year: "numeric",
      })
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
.page { width:210mm; min-height:297mm; padding:12mm 15mm 10mm 15mm; }
.header-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:3mm; }
.logo-box { width:86px; height:86px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.header-center { flex:1; text-align:center; padding:0 5mm; }
.univ-name { font-size:13pt; font-weight:bold; text-transform:uppercase; letter-spacing:0.5px; }
.univ-sub { font-size:9.5pt; margin-top:2mm; line-height:1.4; }
.sep { border:none; border-top:2px solid #333; margin:3mm 0; }
.doc-title { text-align:center; font-size:14pt; font-weight:bold; text-transform:uppercase; letter-spacing:1px; margin:5mm 0 6mm 0; text-decoration:underline; }
.body-text { font-size:10.5pt; line-height:1.8; }
.body-text p { margin-bottom:4mm; text-align:justify; }
.body-text .full-line { text-align:left; }
.sig-section { margin-top:8mm; }
.sig-row { display:flex; align-items:flex-start; justify-content:space-between; gap:10mm; }
.qr-area { display:flex; flex-direction:column; align-items:center; gap:2mm; }
.stamp-area { text-align:center; display:flex; flex-direction:column; align-items:center; gap:2mm; }
.date-line { font-size:10pt; font-style:italic; margin-bottom:2mm; }
.prof-name { font-size:9.5pt; font-weight:bold; margin-top:2mm; }
.footer { position:fixed; bottom:8mm; left:15mm; right:15mm; text-align:center; font-size:8pt; color:#555; border-top:1px solid #ccc; padding-top:2mm; }
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
    <p class="full-line">Le Vice-Recteur chargé des Affaires Académiques (VR-AA) de l'Université d'Abomey-Calavi (UAC)</p>
    <p>
      Atteste que le nommé <strong>${nomComplet}</strong>, né(e) le
      <strong>${dateNaissanceFormatee}</strong> à <strong>${lieuNaissance}</strong>,
      est inscrit(e) à l'Université d'Abomey-Calavi (UAC) sous le numéro matricule
      <strong>${etudiantMatricule || "—"}</strong> dans l'entité&nbsp;:
      <strong>${institutionLabel}</strong>, en
      <strong>${filiere}, ${semestresLabel}</strong> au titre de l'année
      académique&nbsp;: <strong>${anneeAcademique}</strong>.
    </p>
    <p class="full-line">Cette attestation a été délivrée à l'interessé(e) pour servir et valoir ce que de droit.</p>
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