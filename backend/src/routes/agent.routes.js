// src/routes/agent.routes.js

const express    = require("express");
const router     = express.Router();
const authMiddleware  = require("../middlewares/auth.middleware");
const requireSA       = require("../middlewares/requireSA.middleware");
const agentController = require("../controllers/agent.controller");

// Toutes ces routes nécessitent d'être authentifié ET SUPER_ADMIN
router.use(authMiddleware);
router.use(requireSA);

// GET    /api/agents          → liste des agents (hors SUPER_ADMIN)
router.get(   "/",              agentController.getAgents);

// POST   /api/agents          → créer un agent
router.post(  "/",              agentController.createAgent);

// PATCH  /api/agents/:id/toggle → activer / désactiver
router.patch( "/:id/toggle",   agentController.toggleAgentActif);

// DELETE /api/agents/:id      → supprimer (traçabilité conservée)
router.delete("/:id",          agentController.deleteAgent);

// POST   /api/agents/:id/email → envoyer un mail à l'agent
router.post(  "/:id/email",    agentController.sendMailToAgent);

module.exports = router;