const router = require("express").Router();
const ctrl = require("./document.controller");
const auth = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");

// Download: propriétaire uniquement, incrémente le compteur
router.get("/download/:reference", auth, ctrl.telecharger);


router.get(
  "/preview/:reference",
  auth,
  role(
    "ETUDIANT",
    "DIRECTEUR_ADJOINT",
    "DIRECTEUR",
    "SECRETAIRE_GENERAL",
    "SECRETAIRE_ADJOINT",
    "CHEF_DIVISION",
    "SUPER_ADMIN"
  ),
  ctrl.preview
);

// ✅ Avancer un document (DA / Directeur) par référence
// Le front appelle : POST /api/documents/:reference/avancer
router.post(
  "/:reference/avancer",
  auth,
  role("DIRECTEUR_ADJOINT", "DIRECTEUR", "SUPER_ADMIN"),
  ctrl.avancerParReference
);

// Suppression
router.delete("/:reference", auth, role("SUPER_ADMIN"), ctrl.supprimer);

// Vérification publique (QR code)
router.get("/verify/:reference", ctrl.verifier);

module.exports = router;