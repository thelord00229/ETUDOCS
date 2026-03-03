const router = require('express').Router();
const ctrl = require('./demande.controller');
const auth = require('../../middlewares/auth.middleware');
const role = require('../../middlewares/role.middleware');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }
});

const CHEF_DIVISION_ROLES = ["CHEF_DIVISION"];

// Étudiant soumet une demande
router.post(
  '/',
  auth,
  role('ETUDIANT'),
  upload.fields([
    { name: 'CIP', maxCount: 1 },
    { name: 'QUITTANCE', maxCount: 1 },
    { name: 'JUSTIFICATIF_INSCRIPTION', maxCount: 1 },
    { name: 'ACTE_NAISSANCE', maxCount: 1 }
  ]),
  ctrl.soumettre
);

// Liste des demandes selon rôle
router.get('/', auth, ctrl.getDemandes);

// Stats chef division
router.get(
  "/stats/chef-division",
  auth,
  role(...CHEF_DIVISION_ROLES),
  ctrl.getStatsChefDivision
);

// ✅ Stats Directeur Adjoint
router.get(
  "/stats/directeur-adjoint",
  auth,
  role("DIRECTEUR_ADJOINT"),
  ctrl.getStatsDA
);

// Stats Secrétaire Général
router.get(
  "/stats/secretaire-general",
  auth,
  role("SECRETAIRE_GENERAL"),
  ctrl.getStatsSG
);

// Détail d'une demande
router.get('/:id', auth, ctrl.getById);

// Avancer dans le workflow
router.post('/:id/avancer', auth, ctrl.avancer);

// Valider une pièce
router.patch(
  '/pieces/:pieceId',
  auth,
  role(...CHEF_DIVISION_ROLES),
  ctrl.validerPiece
);
router.get("/stats/directeur", authMiddleware, authorize("DIRECTEUR"), getStatsDI);

module.exports = router;