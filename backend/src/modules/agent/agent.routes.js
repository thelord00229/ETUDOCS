const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middlewares/auth.middleware");
const requireSA = require("../../middlewares/requireSA.middleware");
const agentController = require("./agent.controller");

router.use(authMiddleware);
router.use(requireSA);

router.get("/", agentController.getAgents);
router.post("/", agentController.createAgent);
router.patch("/:id/toggle", agentController.toggleAgentActif);
router.delete("/:id", agentController.deleteAgent);
router.post("/:id/email", agentController.sendMailToAgent);

module.exports = router;