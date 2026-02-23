const puppeteer = require('puppeteer');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════
// UTILITAIRES
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

const getDecision = (moyenne) => moyenne >= 10 ? 'Continue' : 'Redouble';

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
      { codeUE: 'MTH1121', intituleUE: 'LOGIQUE, ARITHMETIQUE ET SES APPLICATIONS',       credits: 5, ecus: ['Logique, arithmétique et ses applications'] },
      { codeUE: 'MTH1122', intituleUE: 'MATHEMATIQUES FONDAMENTALES',                      credits: 5, ecus: ['Algèbre linéaire et applications', 'Analyse et applications'] },
      { codeUE: 'INF1124', intituleUE: 'ARCHITECTURE ET TOPOLOGIE DES RESEAUX',            credits: 4, ecus: ['Architecture et topologie des réseaux informatiques'] },
      { codeUE: 'INF1125', intituleUE: "SYSTEME D'EXPLOITATION ET OUTILS DE BASE",         credits: 4, ecus: ["Utilisation et administration sous Windows/Linux", 'Outils de base en informatique'] },
      { codeUE: 'INF1126', intituleUE: 'BASE DE LA PROGRAMMATION',                         credits: 4, ecus: ['Algorithmique', 'Langages C'] },
      { codeUE: 'DRP1127', intituleUE: 'DEONTOLOGIE ET DROIT LIES AUX TIC',                credits: 2, ecus: ['Déontologie et droit liés aux TIC'] },
      { codeUE: 'TCC1128', intituleUE: "TECHNIQUES D'EXPRESSION ECRITE ET ORALE",          credits: 1, ecus: ["Techniques d'expression écrite et orale"] },
    ],
    EPAC: [
      { codeUE: 'GCI1101', intituleUE: 'MECANIQUE DES STRUCTURES',                         credits: 5, ecus: ['Résistance des matériaux', 'Statique des structures'] },
      { codeUE: 'GCI1102', intituleUE: 'MATHEMATIQUES APPLIQUEES AU GENIE CIVIL',          credits: 5, ecus: ['Analyse numérique', 'Equations différentielles'] },
      { codeUE: 'GCI1103', intituleUE: 'MATERIAUX DE CONSTRUCTION',                        credits: 4, ecus: ['Béton et acier', 'Matériaux locaux'] },
      { codeUE: 'GCI1104', intituleUE: 'TOPOGRAPHIE ET CARTOGRAPHIE',                      credits: 4, ecus: ['Topographie générale', 'Cartographie numérique'] },
      { codeUE: 'GCI1105', intituleUE: 'HYDRAULIQUE GENERALE',                             credits: 4, ecus: ['Hydraulique en charge', 'Hydraulique à surface libre'] },
      { codeUE: 'GCI1106', intituleUE: 'DESSIN TECHNIQUE ET DAO',                          credits: 3, ecus: ['Dessin technique', 'DAO assisté par ordinateur'] },
      { codeUE: 'GCI1107', intituleUE: 'COMMUNICATION TECHNIQUE',                          credits: 2, ecus: ['Rédaction technique', 'Expression orale professionnelle'] },
    ],
    FSS: [
      { codeUE: 'BIO1101', intituleUE: 'BIOLOGIE CELLULAIRE ET MOLECULAIRE',               credits: 5, ecus: ['Biologie cellulaire', 'Biologie moléculaire'] },
      { codeUE: 'BIO1102', intituleUE: 'ANATOMIE HUMAINE FONDAMENTALE',                    credits: 5, ecus: ['Anatomie descriptive', 'Anatomie topographique'] },
      { codeUE: 'BIO1103', intituleUE: 'BIOCHIMIE GENERALE',                               credits: 4, ecus: ['Biochimie structurale', 'Biochimie métabolique'] },
      { codeUE: 'BIO1104', intituleUE: 'PHYSIOLOGIE HUMAINE',                              credits: 4, ecus: ['Physiologie cardio-vasculaire', 'Physiologie respiratoire'] },
      { codeUE: 'BIO1105', intituleUE: 'MICROBIOLOGIE ET PARASITOLOGIE',                   credits: 4, ecus: ['Microbiologie générale', 'Parasitologie médicale'] },
      { codeUE: 'BIO1106', intituleUE: 'SANTE PUBLIQUE ET EPIDEMIOLOGIE',                  credits: 3, ecus: ['Epidémiologie descriptive', 'Santé communautaire'] },
      { codeUE: 'BIO1107', intituleUE: 'ETHIQUE ET DEONTOLOGIE MEDICALE',                  credits: 2, ecus: ['Ethique médicale', 'Droits des patients'] },
    ]
  };

  const liste = uesParInstitution[sigle] || uesParInstitution['IFRI'];
  return liste.map(ue => ({ ...ue, moyenneUE: noteAleatoire() }));
};

// ═══════════════════════════════════════
// CONFIGS PAR INSTITUTION
// ═══════════════════════════════════════

const getConfigInstitution = (institution) => {
  const sigle = institution.sigle || 'IFRI';

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
      couleurHeader: '#1a5276',
      couleurTableauHeader: '#2c3e50',
      refFormat: (annee) => `N° ____ -${annee}/UAC/IFRI/SG/SSE/DS`,
    },
    EPAC: {
      sigle: 'EPAC',
      nomComplet: "UNIVERSITE D'ABOMEY-CALAVI",
      sousNom: 'ECOLE POLYTECHNIQUE D\'ABOMEY-CALAVI',
      adresse: 'BP: 2009 COTONOU - TEL: (+229) 21-36-00-00',
      site: 'Site web: https://epac.uac.bj - Courriel: contact@epac.uac.bj',
      mention: 'Génie Civil',
      domaine: 'Sciences de l\'Ingénieur',
      grade: 'Licence Professionnelle',
      couleurPrimaire: '#922b21',
      couleurHeader: '#922b21',
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
      couleurHeader: '#1e8449',
      couleurTableauHeader: '#196f3d',
      refFormat: (annee) => `N° ____ -${annee}/UAC/FSS/DIR/SCO`,
    }
  };

  return configs[sigle] || configs['IFRI'];
};

// ═══════════════════════════════════════
// GÉNÉRATION HTML
// ═══════════════════════════════════════

const buildHTML = (config, etudiant, demande, ues, institution, reference) => {
  const sexe = Math.random() > 0.5 ? 'Masculin' : 'Féminin';
  const annee = new Date().getFullYear();
  const anneeAcademique = `${annee - 1}-${annee}`;
  const dateDoc = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const moyennePonderee = getMoyennePonderee(ues);
  const decision = getDecision(parseFloat(moyennePonderee));
  const creditsCapitalises = ues.filter(ue => ue.moyenneUE >= 10).reduce((s, ue) => s + ue.credits, 0);
  const totalCredits = ues.reduce((s, ue) => s + ue.credits, 0);

  const lignesTableau = ues.map(ue => {
    const cote = getCote(ue.moyenneUE);
    const valide = ue.moyenneUE >= 10;
    const resultat = valide ? 'VALIDE EN' : 'NON VALIDE';
    const session = valide ? 'Févr 2025' : 'Sept 2025';

    let lignes = `
      <tr style="font-weight:bold;">
        <td>${ue.codeUE}</td>
        <td>${ue.intituleUE}</td>
        <td style="text-align:center">${ue.credits}</td>
        <td style="text-align:center">${ue.moyenneUE.toFixed(2)}/20</td>
        <td style="text-align:center">${cote}</td>
        <td style="text-align:center; color:${valide ? 'green' : 'red'}">
          ${resultat}<br><small style="font-weight:normal">${session}</small>
        </td>
      </tr>`;

    ue.ecus.forEach(ecu => {
      const noteEcu = noteAleatoire();
      lignes += `
        <tr style="font-size:10px; color:#555;">
          <td style="padding-left:15px">${ue.codeUE.replace(/^./, '1')}</td>
          <td style="padding-left:15px; font-style:italic">${ecu}</td>
          <td></td>
          <td style="text-align:center">${noteEcu.toFixed(2)}/20</td>
          <td></td><td></td>
        </tr>`;
    });

    return lignes;
  }).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: Arial, sans-serif; font-size:12px; color:#333; padding:28px; }

    .header { display:flex; align-items:center; justify-content:space-between; padding-bottom:10px; border-bottom:3px solid ${config.couleurPrimaire}; }
    .header-center { text-align:center; flex:1; }
    .header-center h2 { font-size:15px; font-weight:bold; color:${config.couleurPrimaire}; }
    .header-center h3 { font-size:12px; font-weight:bold; margin:3px 0; }
    .header-center p  { font-size:10px; }
    .logo-placeholder { width:55px; height:55px; border:1px solid #ccc; display:flex; align-items:center; justify-content:center; font-size:9px; color:#aaa; border-radius:4px; }
    .sigle { font-size:22px; font-weight:bold; color:${config.couleurPrimaire}; width:60px; text-align:center; }

    .numero { text-align:center; font-size:13px; font-weight:bold; margin:10px 0; padding:6px; border:1px solid #ddd; background:#f9f9f9; }

    .infos-bloc { display:flex; gap:15px; margin:10px 0; align-items:flex-start; }
    .qr-box { width:75px; height:75px; border:1px solid #aaa; display:flex; align-items:center; justify-content:center; font-size:8px; color:#aaa; flex-shrink:0; }
    .infos-table { flex:1; font-size:11px; }
    .infos-table table { width:100%; }
    .infos-table td { padding:2px 4px; vertical-align:top; }
    .infos-table td:first-child { color:#555; white-space:nowrap; }
    .photo-box { width:65px; height:80px; border:1px solid #aaa; display:flex; align-items:center; justify-content:center; font-size:8px; color:#aaa; flex-shrink:0; }

    .titre-releve { text-align:center; font-style:italic; font-size:14px; font-weight:bold; margin:14px 0 10px; text-decoration:underline; }

    table.notes { width:100%; border-collapse:collapse; font-size:11px; }
    table.notes th { background:${config.couleurTableauHeader}; color:white; padding:5px 6px; text-align:center; border:1px solid ${config.couleurTableauHeader}; }
    table.notes td { border:1px solid #bbb; padding:3px 5px; }
    table.notes tr:nth-child(even) { background:#f9f9f9; }

    .footer-notes { display:flex; justify-content:space-between; margin-top:6px; font-size:11px; border:1px solid #333; padding:5px 8px; background:#f0f0f0; font-weight:bold; }

    .legende { font-size:9px; color:#666; margin-top:7px; line-height:1.5; }
    .date-lieu { text-align:right; font-style:italic; margin:18px 0 8px; font-size:12px; }

    .signatures { display:flex; justify-content:space-between; margin-top:8px; }
    .sig-bloc { text-align:center; width:45%; }
    .sig-bloc .sig-titre { font-weight:bold; font-size:12px; }
    .sig-bloc .sig-sous  { font-style:italic; font-size:10px; color:#555; margin-bottom:45px; }
    .sig-bloc .sig-nom   { font-weight:bold; font-size:12px; border-top:1px solid #333; padding-top:4px; }

    .ref-doc { font-size:9px; color:#999; text-align:center; margin-top:12px; }
  </style>
</head>
<body>

  <!-- HEADER -->
  <div class="header">
    <div class="logo-placeholder">Logo UAC</div>
    <div class="header-center">
      <h2>${config.nomComplet}</h2>
      <h3>${config.sousNom}</h3>
      <p>${config.adresse}</p>
      <p style="font-style:italic; font-size:10px">${config.site}</p>
    </div>
    <div class="sigle">${config.sigle}</div>
  </div>

  <!-- NUMÉRO -->
  <div class="numero">${config.refFormat(annee)}</div>

  <!-- INFOS ÉTUDIANT -->
  <div class="infos-bloc">
    <div class="qr-box">QR Code</div>
    <div class="infos-table">
      <table>
        <tr><td>Année académique</td><td>: ${anneeAcademique}</td></tr>
        <tr><td>Domaine</td><td>: ${config.domaine}</td></tr>
        <tr><td>Grade</td><td>: ${config.grade}</td></tr>
        <tr><td>Mention</td><td>: ${config.mention}</td></tr>
        <tr><td>Spécialité</td><td>: ${etudiant.filiere || config.mention}</td></tr>
        <tr><td>Nom et Prénoms</td><td>: <strong>${etudiant.nom} ${etudiant.prenom}</strong></td></tr>
        <tr><td>Sexe</td><td>: ${sexe}</td></tr>
        <tr><td>Date et lieu de naissance</td><td>: 01/01/2000 à Cotonou (Bénin)</td></tr>
        <tr><td>Numéro matricule</td><td>: ${etudiant.numeroEtudiant}</td></tr>
      </table>
    </div>
    <div class="photo-box">Photo</div>
  </div>

  <!-- TITRE -->
  <div class="titre-releve">
    Relevé de notes du ${demande.semestre === 1 ? 'Premier' : 'Deuxième'} semestre
  </div>

  <!-- TABLEAU NOTES -->
  <table class="notes">
    <thead>
      <tr>
        <th>Code UE</th>
        <th>Intitulé de l'UE/ECU</th>
        <th>Crédit</th>
        <th>Moy. UE/ECU</th>
        <th>Cote</th>
        <th>Résultat</th>
      </tr>
    </thead>
    <tbody>${lignesTableau}</tbody>
  </table>

  <!-- FOOTER NOTES -->
  <div class="footer-notes">
    <span>Crédits capitalisés : ${creditsCapitalises}/${totalCredits}</span>
    <span>Moyenne semestrielle pondérée : ${moyennePonderee}/20</span>
    <span>Décision du jury : ${decision}</span>
  </div>

  <!-- LÉGENDE -->
  <div class="legende">
    [UE = Unité d'Enseignement] [ECU = Élément Constitutif d'UE] — Moyenne pondérée = Somme(moy UE × crédit)/Somme crédits<br>
    ]16,20]=>A+ / 16=>A / [15,16[=>A- / ]14=>B+ / [13,14[=>B- / ]12,13[=>C+ / 12=>C / [11,12[=>C- / [10,11[=>D+ / [05,10[=>D / ]00,05[=>E / 00=>N/A
  </div>

  <!-- DATE -->
  <div class="date-lieu">Abomey-Calavi, le ${dateDoc}</div>

  <!-- SIGNATURES -->
  <div class="signatures">
    <div class="sig-bloc">
      <div class="sig-titre">Le Directeur-Adjoint,</div>
      <div class="sig-sous">Chargé des affaires académiques</div>
      <div class="sig-nom">${institution.directeurAdjointNom || 'Le Directeur Adjoint'}</div>
    </div>
    <div class="sig-bloc">
      <div class="sig-titre">Le Directeur,</div>
      <div class="sig-sous">&nbsp;</div>
      <div class="sig-nom">${institution.directeurNom || 'Le Directeur'}</div>
    </div>
  </div>

  <div class="ref-doc">Référence : ${reference}</div>

</body>
</html>`;
};

// ═══════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════

exports.generateDocument = async (demande, etudiant, notes, reference, institution) => {
  const outputPath = path.join('uploads', `${reference}.pdf`);
  const config = getConfigInstitution(institution);
  const ues = genererUEs(notes, config.sigle);
  const html = buildHTML(config, etudiant, demande, ues, institution, reference);

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