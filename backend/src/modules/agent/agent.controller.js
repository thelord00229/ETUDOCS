const agentService = require("./agent.service");

exports.getAgents = async (req, res) => {
  try {
    const agents = await agentService.getAgents();
    return res.json(agents);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.createAgent = async (req, res) => {
  const { nom, prenom, email, role, institutionId, service } = req.body;

  if (!nom || !prenom || !email || !role) {
    return res.status(400).json({
      message: "Champs obligatoires manquants (nom, prenom, email, role)",
    });
  }

  if (role === "SUPER_ADMIN") {
    return res.status(403).json({
      message: "Impossible de créer un SUPER_ADMIN ici",
    });
  }

  if (role === "CHEF_DIVISION" && !service) {
    return res.status(400).json({
      message: "Le service est obligatoire pour un Chef de division",
    });
  }

  try {
    const agent = await agentService.createAgent({
      nom,
      prenom,
      email,
      role,
      institutionId,
      service,
    });

    return res.status(201).json(agent);
  } catch (err) {
    console.error(err);

    if (err.message === "EMAIL_EXISTS") {
      return res.status(409).json({ message: "Un compte avec cet email existe déjà" });
    }

    if (err.message === "INSTITUTION_REQUIRED") {
      return res.status(400).json({ message: "institutionId est requis" });
    }

    if (err.message === "INVALID_INSTITUTION") {
      return res.status(400).json({ message: "Institution invalide (introuvable)" });
    }

    return res.status(500).json({
      message: "Erreur lors de la création du compte",
    });
  }
};

exports.toggleAgentActif = async (req, res) => {
  const { id } = req.params;

  try {
    const updated = await agentService.toggleAgentActif(id);
    return res.json({ id: updated.id, actif: updated.actif });
  } catch (err) {
    console.error(err);

    if (err.message === "AGENT_NOT_FOUND") {
      return res.status(404).json({ message: "Agent introuvable" });
    }

    if (err.message === "FORBIDDEN_SUPER_ADMIN") {
      return res.status(403).json({ message: "Impossible de modifier un SUPER_ADMIN" });
    }

    return res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.deleteAgent = async (req, res) => {
  const { id } = req.params;

  try {
    await agentService.deleteAgent(id);
    return res.json({ message: "Agent supprimé avec succès" });
  } catch (err) {
    console.error(err);

    if (err.message === "AGENT_NOT_FOUND") {
      return res.status(404).json({ message: "Agent introuvable" });
    }

    if (err.message === "FORBIDDEN_SUPER_ADMIN") {
      return res.status(403).json({ message: "Impossible de supprimer un SUPER_ADMIN" });
    }

    return res.status(500).json({ message: "Erreur lors de la suppression" });
  }
};

exports.sendMailToAgent = async (req, res) => {
  const { id } = req.params;
  const { subject, body } = req.body;

  if (!subject || !body) {
    return res.status(400).json({ message: "Objet et message requis" });
  }

  try {
    await agentService.sendMailToAgent(id, subject, body);
    return res.json({ message: "Email envoyé avec succès" });
  } catch (err) {
    console.error(err);

    if (err.message === "AGENT_NOT_FOUND") {
      return res.status(404).json({ message: "Agent introuvable" });
    }

    return res.status(500).json({ message: "Erreur lors de l'envoi de l'email" });
  }
};