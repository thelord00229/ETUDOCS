/**
 * bulletin.template.js
 * Template HTML complet pour la génération du relevé de notes
 * Chemin conseillé : backend/src/services/bulletin.template.js
 *
 * Usage dans pdf.service.js :
 *   const { buildHtml } = require('./bulletin.template');
 *   const html = buildHtml(payload);
 */

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

/* En-tête tableau */
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

/* Lignes UE (unité d'enseignement) */
.row-ue td {
  background-color: #b8cce4;
  font-weight: bold;
  padding: 1.2mm 1.2mm;
  border: 0.5px solid #7a9ec0;
  font-size: 7.5pt;
  line-height: 1.2;
}

/* Lignes ECU (élément constitutif) */
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

.cell-intitule {
  text-align: left;
  width: 37%;
}

.ecu-indent {
  padding-left: 6mm !important;
  font-style: italic;
}

.cell-num {
  text-align: center;
  width: 9%;
}

.cell-num-ecu {
  text-align: center;
  width: 9%;
  background-color: #dce6f1;
  border: 0.5px solid #aac4e0;
  padding: 0.9mm 1.2mm;
}

.cell-cote {
  text-align: center;
  width: 7%;
  font-weight: bold;
}

.cell-result {
  text-align: center;
  width: 26%;
  font-size: 7pt;
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
  margin-top: 0;
  justify-content: space-around;
  align-items: center;
  border-top: none;
}

.sum-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.5mm;
}

.sum-label {
  font-size: 6.8pt;
  font-weight: normal;
  opacity: 0.9;
}

.sum-val {
  font-size: 9pt;
  font-weight: bold;
}

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

.date-val {
  font-weight: bold;
  font-style: normal;
}

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

  <!-- ══ EN-TÊTE ══ -->
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

  <!-- ══ NUMÉRO DOCUMENT ══ -->
  <div class="doc-number-line">
    <span>N°&nbsp;</span><span class="doc-ref">${reference}</span>
  </div>

  <!-- ══ BLOC ÉTUDIANT ══ -->
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

    <div class="photo-box">Photo<br/>étudiant</div>
  </div>

  <!-- ══ TITRE RELEVÉ ══ -->
  <div class="releve-title">Relevé de notes du ${semestreLabel} semestre</div>

  <!-- ══ TABLEAU DES NOTES ══ -->
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

  <!-- ══ BARRE RÉCAPITULATIVE ══ -->
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

  <!-- ══ LÉGENDE ══ -->
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

  <!-- ══ DATE ══ -->
  <div class="date-line">
    Abomey-Calavi, le&nbsp;<span class="date-val">${dateGeneration}</span>
  </div>

  <!-- ══ SIGNATURES ══ -->
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

module.exports = { buildHtml };