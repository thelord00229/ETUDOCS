const puppeteer = require('puppeteer');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode'); // QR en base64

// ═══════════════════════════════════════
// OUTILS FICHIERS → DATA URL (base64)
// ═══════════════════════════════════════
const fileToDataUrl = (absPath) => {
  const ext = path.extname(absPath).toLowerCase();
  const mime =
    ext === '.png' ? 'image/png' :
    ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
    null;

  if (!mime) return null;
  const buffer = fs.readFileSync(absPath);
  return `data:${mime};base64,${buffer.toString('base64')}`;
};

const getLogoDataUrl = (institution) => {
  const sigle = institution?.sigle || 'IFRI';
  // ✅ tu mets tes logos ici : src/assets/logos/IFRI.png, EPAC.png, FSS.png
  const logoPath = path.join(__dirname, '..', 'assets', 'logos', `${sigle}.png`);
  if (!fs.existsSync(logoPath)) return null;
  return fileToDataUrl(logoPath);
};

// ═══════════════════════════════════════
// UTILITAIRES NOTES / CALCULS
// ═══════════════════════════════════════
const noteAleatoire = (min = 8, max = 18) =>
  parseFloat((Math.random() * (max - min) + min).toFixed(2));

const getCote = (note) => {
  if (note >= 16) return 'A+';
  if (note >= 15) return 'A';
  if (note >= 14) return 'A-';
  if (note >= 13) return 'B+';
  if (note >= 12) return 'B-';
  if (note >= 11) return 'C+';
  if (note >= 10) return 'C';
  if (note >= 9)  return 'D+';
  if (note >= 5)  return 'D';
  if (note > 0)   return 'E';
  return 'N/A';
};

const getDecision = (moyenne) => (moyenne >= 10 ? 'Continue' : 'Redouble');

const getMoyennePonderee = (ues) => {
  const totalCredits = ues.reduce((sum, ue) => sum + ue.credits, 0);
  const totalPoints  = ues.reduce((sum, ue) => sum + (ue.moyenneUE * ue.credits), 0);
  return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
};

const genererUEs = (notes, sigle) => {
  if (notes && notes.length > 0) {
    return notes.map(n => ({
      codeUE: n.ue.code,
      intituleUE: n.ue.intitule,
      credits: n.ue.credits,
      moyenneUE: n.note_finale || noteAleatoire(),
      ecus: []
    }));
  }

  const uesParInstitution = {
    IFRI: [
      { codeUE: 'MTH1121', intituleUE: 'LOGIQUE, ARITHMETIQUE ET SES APPLICATIONS', credits: 5, ecus: ['Logique, arithmétique et ses applications'] },
      { codeUE: 'MTH1122', intituleUE: 'MATHEMATIQUES FONDAMENTALES', credits: 5, ecus: ['Algèbre linéaire et applications', 'Analyse et applications'] },
      { codeUE: 'INF1124', intituleUE: 'ARCHITECTURE ET TOPOLOGIE DES RESEAUX', credits: 4, ecus: ['Architecture et topologie des réseaux informatiques'] },
      { codeUE: 'INF1125', intituleUE: "SYSTEME D'EXPLOITATION ET OUTILS DE BASE", credits: 4, ecus: ["Utilisation et administration sous Windows/Linux", 'Outils de base en informatique'] },
      { codeUE: 'INF1126', intituleUE: 'BASE DE LA PROGRAMMATION', credits: 4, ecus: ['Algorithmique', 'Langages C'] },
      { codeUE: 'DRP1127', intituleUE: 'DEONTOLOGIE ET DROIT LIES AUX TIC', credits: 2, ecus: ['Déontologie et droit liés aux TIC'] },
      { codeUE: 'TCC1128', intituleUE: "TECHNIQUES D'EXPRESSION ECRITE ET ORALE", credits: 1, ecus: ["Techniques d'expression écrite et orale"] },
    ],
    EPAC: [
      { codeUE: 'GCI1101', intituleUE: 'MECANIQUE DES STRUCTURES', credits: 5, ecus: ['Résistance des matériaux', 'Statique des structures'] },
      { codeUE: 'GCI1102', intituleUE: 'MATHEMATIQUES APPLIQUEES AU GENIE CIVIL', credits: 5, ecus: ['Analyse numérique', 'Equations différentielles'] },
      { codeUE: 'GCI1103', intituleUE: 'MATERIAUX DE CONSTRUCTION', credits: 4, ecus: ['Béton et acier', 'Matériaux locaux'] },
      { codeUE: 'GCI1104', intituleUE: 'TOPOGRAPHIE ET CARTOGRAPHIE', credits: 4, ecus: ['Topographie générale', 'Cartographie numérique'] },
      { codeUE: 'GCI1105', intituleUE: 'HYDRAULIQUE GENERALE', credits: 4, ecus: ['Hydraulique en charge', 'Hydraulique à surface libre'] },
      { codeUE: 'GCI1106', intituleUE: 'DESSIN TECHNIQUE ET DAO', credits: 3, ecus: ['Dessin technique', 'DAO assisté par ordinateur'] },
      { codeUE: 'GCI1107', intituleUE: 'COMMUNICATION TECHNIQUE', credits: 2, ecus: ['Rédaction technique', 'Expression orale professionnelle'] },
    ],
    FSS: [
      { codeUE: 'BIO1101', intituleUE: 'BIOLOGIE CELLULAIRE ET MOLECULAIRE', credits: 5, ecus: ['Biologie cellulaire', 'Biologie moléculaire'] },
      { codeUE: 'BIO1102', intituleUE: 'ANATOMIE HUMAINE FONDAMENTALE', credits: 5, ecus: ['Anatomie descriptive', 'Anatomie topographique'] },
      { codeUE: 'BIO1103', intituleUE: 'BIOCHIMIE GENERALE', credits: 4, ecus: ['Biochimie structurale', 'Biochimie métabolique'] },
      { codeUE: 'BIO1104', intituleUE: 'PHYSIOLOGIE HUMAINE', credits: 4, ecus: ['Physiologie cardio-vasculaire', 'Physiologie respiratoire'] },
      { codeUE: 'BIO1105', intituleUE: 'MICROBIOLOGIE ET PARASITOLOGIE', credits: 4, ecus: ['Microbiologie générale', 'Parasitologie médicale'] },
      { codeUE: 'BIO1106', intituleUE: 'SANTE PUBLIQUE ET EPIDEMIOLOGIE', credits: 3, ecus: ['Epidémiologie descriptive', 'Santé communautaire'] },
      { codeUE: 'BIO1107', intituleUE: 'ETHIQUE ET DEONTOLOGIE MEDICALE', credits: 2, ecus: ['Ethique médicale', 'Droits des patients'] },
    ]
  };

  const liste = uesParInstitution[sigle] || uesParInstitution['IFRI'];
  return liste.map(ue => ({ ...ue, moyenneUE: noteAleatoire() }));
};

// ═══════════════════════════════════════
// CONFIGS PAR INSTITUTION
// ═══════════════════════════════════════
const getConfigInstitution = (institution) => {
  const sigle = institution?.sigle || 'IFRI';

  const configs = {
    IFRI: {
      sigle: 'IFRI',
      nomComplet: "UNIVERSITE D'ABOMEY-CALAVI",
      sousNom: 'INSTITUT DE FORMATION ET DE RECHERCHE EN INFORMATIQUE',
      adresse: 'BP: 526 COTONOU - TEL: (+229) 55-028-070',
      site: 'Site web: https://www.ifri-uac.bj - Courriel: contact@ifri.uac.bj',
      mention: 'Informatique',
      domaine: 'Sciences et Technologies',
      grade: 'Licence',
      couleurPrimaire: '#1a5276',
      couleurTableauHeader: '#2c3e50',
      refFormat: (annee) => `N° ____ -${annee}/UAC/IFRI/SG/SSE/DS`,
    },
    EPAC: {
      sigle: 'EPAC',
      nomComplet: "UNIVERSITE D'ABOMEY-CALAVI",
      sousNom: "ECOLE POLYTECHNIQUE D'ABOMEY-CALAVI",
      adresse: 'BP: 2009 COTONOU - TEL: (+229) 21-36-00-00',
      site: 'Site web: https://epac.uac.bj - Courriel: contact@epac.uac.bj',
      mention: 'Génie Civil',
      domaine: "Sciences de l'Ingénieur",
      grade: 'Licence Professionnelle',
      couleurPrimaire: '#922b21',
      couleurTableauHeader: '#7b241c',
      refFormat: (annee) => `N° ____ -${annee}/UAC/EPAC/SG/SCO`,
    },
    FSS: {
      sigle: 'FSS',
      nomComplet: "UNIVERSITE D'ABOMEY-CALAVI",
      sousNom: 'FACULTE DES SCIENCES DE LA SANTE',
      adresse: 'BP: 188 COTONOU - TEL: (+229) 21-30-08-50',
      site: 'Site web: https://fss.uac.bj - Courriel: contact@fss.uac.bj',
      mention: 'Sciences de la Santé',
      domaine: 'Sciences Biomédicales',
      grade: 'Licence en Sciences de la Santé',
      couleurPrimaire: '#1e8449',
      couleurTableauHeader: '#196f3d',
      refFormat: (annee) => `N° ____ -${annee}/UAC/FSS/DIR/SCO`,
    }
  };

  return configs[sigle] || configs.IFRI;
};

// ═══════════════════════════════════════
// HTML
// ═══════════════════════════════════════
const buildHTML = (config, etudiant, demande, ues, institution, reference, qrDataUrl, logoDataUrl) => {
  const annee = new Date().getFullYear();
  const anneeAcademique = `${annee - 1}-${annee}`;

  // ✅ Date = jour de génération du PDF
  const dateDoc = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const uacLogoPath = path.join(__dirname, '..', 'assets', 'logos', 'UAC.png');
  const uacLogo = fs.existsSync(uacLogoPath) ? fileToDataUrl(uacLogoPath) : null;

  const qrHtml = qrDataUrl
    ? `<img src="${qrDataUrl}" alt="QR" style="width:90px;height:90px;object-fit:contain;" />`
    : `<div style="width:90px;height:90px;border:1px solid #333;"></div>`;

  const ifriLogoHtml = logoDataUrl
    ? `<img src="${logoDataUrl}" alt="IFRI" style="width:120px;height:70px;object-fit:contain;" />`
    : `<div style="width:120px;height:70px;"></div>`;

  const uacLogoHtml = uacLogo
    ? `<img src="${uacLogo}" alt="UAC" style="width:80px;height:80px;object-fit:contain;" />`
    : `<div style="width:80px;height:80px;"></div>`;

  const moyennePonderee = getMoyennePonderee(ues);
  const decision = getDecision(parseFloat(moyennePonderee));
  const creditsCapitalises = ues.filter(ue => ue.moyenneUE >= 10).reduce((s, ue) => s + ue.credits, 0);
  const totalCredits = ues.reduce((s, ue) => s + ue.credits, 0);

  const lignesTableau = ues.map(ue => {
    const cote = getCote(ue.moyenneUE);
    const valide = ue.moyenneUE >= 10;
    const resultat = valide ? 'VALIDE EN' : 'NON VALIDE';
    const session = valide ? 'Févr 2025' : 'Sept 2025';

    let html = `
      <tr class="ue-row">
        <td class="code">${ue.codeUE}</td>
        <td class="intitule">${ue.intituleUE}</td>
        <td class="credit">${ue.credits}</td>
        <td class="moy">${ue.moyenneUE.toFixed(2)}/20</td>
        <td class="cote">${cote}</td>
        <td class="resultat">${resultat}<small>${session}</small></td>
      </tr>
    `;

    ue.ecus.forEach((ecu, idx) => {
      const noteEcu = noteAleatoire();
      const codeEcu = `${idx + 1}${ue.codeUE}`; // ex: 1MTH1121
      html += `
        <tr class="ecu-row">
          <td class="code">${codeEcu}</td>
          <td class="intitule">${ecu}</td>
          <td class="credit"></td>
          <td class="moy">${noteEcu.toFixed(2)}/20</td>
          <td class="cote"></td>
          <td class="resultat"></td>
        </tr>
      `;
    });

    return html;
  }).join('');

  const daStampPath = path.join(__dirname, '..', 'assets', 'stamps', 'DA.png');
  const daStamp = fs.existsSync(daStampPath) ? fileToDataUrl(daStampPath) : null;

  const daStampHtml = daStamp
    ? `<img src="${daStamp}" class="stamp-img da-stamp" />`
    : '';

  const dirStampPath = path.join(__dirname, '..', 'assets', 'stamps', 'DIR.png');
  const dirStamp = fs.existsSync(dirStampPath) ? fileToDataUrl(dirStampPath) : null;

  const dirStampHtml = dirStamp
    ? `<img src="${dirStamp}" class="stamp-img dir-stamp" />`
    : '';

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: Arial, sans-serif; padding:30px; }

  .header { display:flex; justify-content:space-between; align-items:center; }
  .header-center { text-align:center; flex:1; }
  .header-center h1 { font-size:18px; margin:0; font-weight:bold; }
  .header-center h2 { font-size:14px; margin:4px 0; font-weight:bold; }
  .header-center p { margin:2px 0; font-size:12px; }

  .numero { text-align:center; margin-top:10px; font-size:14px; font-weight:bold; }

  .infos { display:flex; margin-top:20px; align-items:flex-start; }
  .infos-text {
    flex:1; margin:0 20px;
    font-family: "Courier New", monospace;
    font-size:13px;
  }
  .infos-text div { margin-bottom:4px; }
  .photo { width:90px; height:110px; border:1px solid #333; }

  .titre {
    text-align:center; margin-top:25px;
    font-size:16px; font-style:italic; text-decoration:underline;
    font-family: "Courier New", monospace;
  }

  table.notes {
    width: 100%;
    border-collapse: collapse;
    font-family: "Courier New", monospace;
    font-size: 13px;
    margin-top: 14px;
  }

  table.notes th, table.notes td {
    border: 2px solid #333;
    padding: 6px 8px;
    vertical-align: top;
  }

  table.notes th {
    text-align: center;
    font-weight: bold;
    background: rgba(0,0,0,0.08);
  }

  td.code { width: 120px; }
  td.intitule { width: auto; }
  td.credit { width: 90px; text-align: center; }
  td.moy { width: 140px; text-align: center; }
  td.cote { width: 70px; text-align: center; }
  td.resultat { width: 150px; text-align: center; font-weight: bold; }

  tr.ue-row td.intitule { font-weight: bold; text-transform: uppercase; }
  tr.ecu-row td { border-top: 0; }
  tr.ecu-row td.intitule { font-style: italic; }
  tr.ecu-row td.code { color: #222; }

  .resultat small {
    display: block;
    margin-top: 4px;
    font-weight: normal;
  }

  .footer-table { margin-top:0; border-top:0; }
  .footer-table td { font-weight:bold; }

  /* ====== BAS DE PAGE (comme le modèle) ====== */
  .bas {
    margin-top: 10px;
    font-family: "Courier New", monospace;
  }

  .legende {
    font-size: 10px;
    line-height: 1.45;
  }

  .date-lieu {
    margin-top: 12px;
    text-align: right;
    font-size: 12px;
    font-style: italic;
  }

  .signatures {
    margin-top: 18px;
    display: flex;
    justify-content: space-between;
    gap: 30px;
  }

  .sig-col {
    width: 48%;
  }

  .sig-titre {
    font-family: Arial, sans-serif;
    font-weight: bold;
    font-size: 18px;
  }

  .sig-sous {
    margin-top: 6px;
    font-size: 12px;
    font-style: italic;
  }

 .sig-zone {
    margin-top: 10px;
    height: 130px;
    position: relative;
 }

    .stamp-img {
        position: absolute;
        width: 180px;
        opacity: 0.35;
    }

    .da-stamp {
        left: 80px;
        top: -10px;
        transform: rotate(-15deg);
    }

    .dir-stamp {
        right: 80px;
        top: -10px;
        transform: rotate(15deg);
    }

  .name-line {
    margin-top: 12px;
    font-family: Arial, sans-serif;
    font-weight: bold;
    font-size: 18px;
    display: inline-block;
    border-bottom: 2px solid #000;
    padding-bottom: 2px;
  }
    body { page-break-after: avoid; }
    .signatures { page-break-inside: avoid; }
    table { page-break-inside: auto; }
    tr { page-break-inside: avoid; page-break-after: auto; }
</style>
</head>

<body>

<div class="header">
  ${uacLogoHtml}
  <div class="header-center">
    <h1>UNIVERSITE D'ABOMEY-CALAVI</h1>
    <h2>INSTITUT DE FORMATION ET DE RECHERCHE EN INFORMATIQUE</h2>
    <p>BP: 526 COTONOU - TEL: (+229) 55-028-070</p>
    <p><i>Site web: https://www.ifri-uac.bj - Courriel: contact@ifri.uac.bj</i></p>
  </div>
  ${ifriLogoHtml}
</div>

<div class="numero">${reference}</div>

<div class="infos">
  <div>${qrHtml}</div>

  <div class="infos-text">
    <div>Année académique : ${anneeAcademique}</div>
    <div>Domaine : Sciences et Technologies</div>
    <div>Grade : Licence</div>
    <div>Mention : Informatique</div>
    <div>Spécialité : ${etudiant.filiere || 'Systèmes Embarqués et Internet des Objets'}</div>
    <div>Nom et Prénoms : <b>${etudiant.nom} ${etudiant.prenom}</b></div>
    <div>Sexe : Masculin</div>
    <div>Date et lieu de naissance : 01/01/2000 à Porto-Novo (Bénin)</div>
    <div>Numéro matricule : ${etudiant.numeroEtudiant}</div>
  </div>

  <div class="photo"></div>
</div>

<div class="titre">
  Relevé de notes du ${demande.semestre === 1 ? 'Premier' : 'Deuxième'} semestre
</div>

<table class="notes">
  <thead>
    <tr>
      <th>Code UE</th>
      <th style="text-align:left">Intitulé de l'UE/ECU</th>
      <th>Crédit</th>
      <th>Moy. UE/ECU</th>
      <th>Cote</th>
      <th>Résultat</th>
    </tr>
  </thead>
  <tbody>
    ${lignesTableau}
  </tbody>
</table>

<table class="notes footer-table">
  <tr>
    <td style="text-align:left;">
      Crédits capitalisés : ${totalCredits > 0 ? ((creditsCapitalises / totalCredits) * 100).toFixed(2) : '0.00'} %
    </td>
    <td style="text-align:center;">
      Moyenne semestrielle pondérée : ${moyennePonderee}/20
    </td>
    <td style="text-align:right;">
      Decision du jury : ${decision}
    </td>
  </tr>
</table>

<div class="bas">
  <div class="legende">
    [UE = Unité d'Enseignement] et [ECU = Élément Constitutif d'Unité d'Enseignement] [Moyenne semestrielle pondérée = Somme(moyenne UE * crédit UE)/Somme crédits UE]<br>
    [Crédits capitalisés - Semestre ${demande.semestre || 1}]<br>
    ]16,20]=>A+ / ]16=>A / [15,16[=>A- / ]14,15[=>B+ / ]14=>B / [13,14[=>B- / ]12,13[=>C+ / ]12=>C / [11,12[=>C- / [10,11[=>D+ / [05,10[=>D / ]00,05[=>E / 00=>N/A<br>
    Si nombre de Zéro &gt; 5 =&gt; N (Abandon)
  </div>

  <div class="date-lieu">Abomey-Calavi, le ${dateDoc}</div>

  <div class="signatures">
    <div class="sig-col">
      <div class="sig-titre">Le Directeur-Adjoint,</div>
      <div class="sig-sous">Chargé des affaires académiques</div>
        <div class="sig-zone">
            ${daStampHtml}
        </div>
      <div class="name-line">${institution.directeurAdjointNom || 'Professeur Gaston EDAH'}</div>
    </div>

    <div class="sig-col" style="text-align:right;">
      <div class="sig-titre" style="text-align:center;">Le Directeur,</div>
      <div class="sig-sous" style="text-align:center;">&nbsp;</div>
      <div class="sig-zone">
            ${dirStampHtml}
      </div>
      <div class="name-line" style="float:right;">
        ${institution.directeurNom || 'Professeur Eugène C. EZIN'}
      </div>
    </div>
  </div>
</div>

</body>
</html>
`;
};

// ═══════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════
exports.generateDocument = async (demande, etudiant, notes, reference, institution, qrPayload) => {
  const outputPath = path.join('uploads', `${reference}.pdf`);
  const config = getConfigInstitution(institution);
  const ues = genererUEs(notes, config.sigle);

  const qrDataUrl = qrPayload
    ? await QRCode.toDataURL(qrPayload, { width: 200, margin: 1 })
    : null;

  const logoDataUrl = getLogoDataUrl(institution);

  const html = buildHTML(config, etudiant, demande, ues, institution, reference, qrDataUrl, logoDataUrl);

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.pdf({ path: outputPath, format: 'A4', printBackground: true });
  await browser.close();

  return outputPath;
};

exports.apposSignature = async (pdfPath, signaturePath, position) => {
  if (!signaturePath || !fs.existsSync(signaturePath)) return;
  const pdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const page = pdfDoc.getPages()[0];
  const sigBytes = fs.readFileSync(signaturePath);
  const sigImg = await pdfDoc.embedPng(sigBytes);
  const x = position === 'directeur' ? 380 : 100;
  page.drawImage(sigImg, { x, y: 80, width: 120, height: 60 });
  fs.writeFileSync(pdfPath, await pdfDoc.save());
};