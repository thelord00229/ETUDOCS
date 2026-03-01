const router = require("express").Router();
const ctrl = require("./document.controller");
const auth = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");

// Download: uniquement propriétaire (déjà check dans controller) + auth ok
router.get("/download/:reference", auth, ctrl.telecharger);

// Suppression: réservé (beaucoup plus crédible)
router.delete("/:reference", auth, role("SUPER_ADMIN"), ctrl.supprimer);

// Vérification: publique (QR code)
router.get("/verify/:reference", ctrl.verifier);

module.exports = router;