const router = require("express").Router();
const ctrl = require("./document.controller");
const auth = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");

// Download: propriétaire uniquement, incrémente le compteur
router.get("/download/:reference", auth, ctrl.telecharger);

// ✅ Preview: agents seulement, inline sans toucher au compteur
router.get("/preview/:reference", auth, role("DIRECTEUR_ADJOINT", "DIRECTEUR", "SECRETAIRE_GENERAL", "SECRETAIRE_ADJOINT", "CHEF_DIVISION", "SUPER_ADMIN"), ctrl.preview);

// Suppression
router.delete("/:reference", auth, role("SUPER_ADMIN"), ctrl.supprimer);

// Vérification publique (QR code)
router.get("/verify/:reference", ctrl.verifier);

module.exports = router;