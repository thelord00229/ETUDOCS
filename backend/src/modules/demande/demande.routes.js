const router = require("express").Router();
const ctrl = require("./demande.controller");
const auth = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");

const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

// ─────────────────────────────────────────────
// Upload pièces justificatives
// ─────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

const CHEF_DIVISION_ROLES = ["CHEF_DIVISION"];

// ─────────────────────────────────────────────
// Étudiant soumet une demande
// POST /api/demandes
// ─────────────────────────────────────────────
router.post(
  "/",
  auth,
  role("ETUDIANT"),
  upload.fields([
    { name: "CIP", maxCount: 1 },
    { name: "QUITTANCE", maxCount: 1 },
    { name: "JUSTIFICATIF_INSCRIPTION", maxCount: 1 },
    { name: "ACTE_NAISSANCE", maxCount: 1 },
  ]),
  ctrl.soumettre
);

// ─────────────────────────────────────────────
// Liste des demandes selon rôle
// GET /api/demandes
// ─────────────────────────────────────────────
router.get("/", auth, ctrl.getDemandes);

// ─────────────────────────────────────────────
// Stats Chef Division
// GET /api/demandes/stats/chef-division
// ─────────────────────────────────────────────
router.get(
  "/stats/chef-division",
  auth,
  role(...CHEF_DIVISION_ROLES),
  ctrl.getStatsChefDivision
);

// ─────────────────────────────────────────────
// Stats Directeur Adjoint
// GET /api/demandes/stats/directeur-adjoint
// ─────────────────────────────────────────────
router.get(
  "/stats/directeur-adjoint",
  auth,
  role("DIRECTEUR_ADJOINT"),
  ctrl.getStatsDA
);

// ─────────────────────────────────────────────
// Stats Secrétaire Général
// GET /api/demandes/stats/secretaire-general
// ─────────────────────────────────────────────
router.get(
  "/stats/secretaire-general",
  auth,
  role("SECRETAIRE_GENERAL"),
  ctrl.getStatsSG
);

// ─────────────────────────────────────────────
// Stats Directeur
// GET /api/demandes/stats/directeur
// ─────────────────────────────────────────────
router.get("/stats/directeur", auth, role("DIRECTEUR"), ctrl.getStatsDI);

// ─────────────────────────────────────────────
// Détail d'une demande
// GET /api/demandes/:id
// ─────────────────────────────────────────────
router.get("/:id", auth, ctrl.getById);

// ─────────────────────────────────────────────
// Avancer dans le workflow (selon rôle)
// POST /api/demandes/:id/avancer
// ─────────────────────────────────────────────
router.post("/:id/avancer", auth, ctrl.avancer);

// ─────────────────────────────────────────────
// Valider une pièce (Chef Division)
// PATCH /api/demandes/pieces/:pieceId
// ─────────────────────────────────────────────
router.patch(
  "/pieces/:pieceId",
  auth,
  role(...CHEF_DIVISION_ROLES),
  ctrl.validerPiece
);

module.exports = router;