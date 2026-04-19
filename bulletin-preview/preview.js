const { buildHtml } = require('./bulletin.template');
const fs = require('fs');

const mockPayload = {
  institutionNom: "Institut de Formation et de Recherche en Informatique",
  institutionSigle: "IFRI",
  directeurNom: "Prof. JOHN DOE",
  directeurTitre: "",
  directeurAdjointNom: "Dr. JANE SMITH",
  directeurAdjointTitre: "Chargée des affaires académiques",
  etudiantNom: "HOUESSOU",
  etudiantPrenom: "Koffi Médard",
  etudiantMatricule: "21IFRI0042",
  etudiantFiliere: "Génie Logiciel",
  etudiantNiveau: "L2",
  reference: "IFRI/REL/2024-25/0001",
  semestre: 1,
  anneeAcademique: "2024 - 2025",
  dateGeneration: "20 avril 2025",
  domaine: "Sciences et Technologies",
  grade: "Licence",
  mention: "Informatique",
  adresse: "BP 526 Cotonou, Bénin",
  siteWeb: "www.ifri-uac.bj",
  email: "contact@ifri-uac.bj",
  logoUACBase64: null,
  logoInstitutionBase64: null,
  tamponDABase64: null,
  tamponDIRBase64: null,
  qrBase64: null,
  notes: {
    rows: [
      {
        code: "INF101",
        intitule: "Algorithmique et programmation",
        credits: 6,
        moyUE: 14.5,
        cote: "B+",
        sessionValidation: "Session normale — Validé",
        ecus: [
          { code: "INF101A", intitule: "Cours magistral algo", note: 15.0 },
          { code: "INF101B", intitule: "TP programmation C", note: 14.0 },
        ],
      },
      {
        code: "MAT101",
        intitule: "Mathématiques discrètes",
        credits: 4,
        moyUE: 11.25,
        cote: "C-",
        sessionValidation: "Session normale — Validé",
        ecus: [
          { code: "MAT101A", intitule: "Logique et ensembles", note: 12.5 },
          { code: "MAT101B", intitule: "Combinatoire et graphes", note: 10.0 },
        ],
      },
    ],
    moyenneSemestrielle: 13.1,
    creditsCapitalises: 100,
    decision: "ADMIS",
  },
};

const html = buildHtml(mockPayload);
fs.writeFileSync('./output.html', html);
console.log('✅ output.html généré');