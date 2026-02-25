const router = require('express').Router();
const ctrl = require('./demande.controller');
const auth = require('../../middlewares/auth.middleware');
const role = require('../../middlewares/role.middleware');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Configuration stockage fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB max
});

// ✅ Tous les rôles possibles pour Chef Division (Examens / autre)
// (on garde CHEF_DIVISION pour compatibilité)
const CHEF_DIVISION_ROLES = ['CHEF_DIVISION', 'CHEF_DIVISION_EXAMENS', 'CHEF_DIVISION_PEDAGOGIE'];

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

// Détail d’une demande
router.get('/:id', auth, ctrl.getById);

// Avancer dans le workflow
router.post('/:id/avancer', auth, ctrl.avancer);

// Valider une pièce (chef division uniquement)
router.patch(
  '/pieces/:pieceId',
  auth,
  role(...CHEF_DIVISION_ROLES),
  ctrl.validerPiece
);

module.exports = router;