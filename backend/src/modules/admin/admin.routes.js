const router = require("express").Router();
const path = require("path");

const ctrl = require("./admin.controller");
const auth = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");

// Toutes les routes admin nécessitent d'être connecté et SUPER_ADMIN
router.post("/agents", auth, role("SUPER_ADMIN"), ctrl.creerAgent);
router.get("/agents", auth, role("SUPER_ADMIN"), ctrl.getAgents);
router.patch("/agents/:userId/toggle", auth, role("SUPER_ADMIN"), ctrl.toggleActif);

router.put("/institutions/:institutionId", auth, role("SUPER_ADMIN"), ctrl.configurerInstitution);
router.get("/institutions", auth, role("SUPER_ADMIN"), ctrl.getInstitutions);

router.get("/statistiques", auth, role("SUPER_ADMIN"), ctrl.getStatistiques);

// Download modèle notes
router.get("/model-notes", auth, role("SUPER_ADMIN"), (req, res) => {
  const filePath = path.join(__dirname, "../../templates/model_notes.xlsx");
  return res.download(filePath, "modele_notes.xlsx");
});

// ✅ SLA Analytics (même middleware que le reste)
router.get("/analytics/sla", auth, role("SUPER_ADMIN"), ctrl.getSlaEvolution);

router.get("/dashboard", auth, role("SUPER_ADMIN"), ctrl.getDashboard);

router.use("/analytics", require("./admin.analytics.routes"));

module.exports = router;