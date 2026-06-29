const bcrypt = require("bcryptjs");
const prisma = require("../../config/prisma");
const emailService = require("../../services/email/email.service");

const DEFAULT_PASSWORD = "Password123!";

exports.getAgents = async () => {
  return prisma.utilisateur.findMany({
    where: { role: { not: "SUPER_ADMIN" } },
    include: {
      institution: {
        select: { id: true, nom: true, sigle: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

exports.createAgent = async ({ nom, prenom, email, role, institutionId, service }) => {
  const existing = await prisma.utilisateur.findUnique({
    where: { email },
  });

  if (existing) {
    throw new Error("EMAIL_EXISTS");
  }

  if (!institutionId) {
    throw new Error("INSTITUTION_REQUIRED");
  }

  const inst = await prisma.institution.findUnique({
    where: { id: institutionId },
  });

  if (!inst) {
    throw new Error("INVALID_INSTITUTION");
  }

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  const agent = await prisma.utilisateur.create({
    data: {
      nom,
      prenom,
      email,
      role,
      password: hashedPassword,
      actif: true,
      institutionId: institutionId || null,
      service: role === "CHEF_DIVISION" ? service : null,
    },
    include: {
      institution: {
        select: { id: true, nom: true, sigle: true },
      },
    },
  });

  await sendWelcomeMail(agent, DEFAULT_PASSWORD);

  return agent;
};

exports.toggleAgentActif = async (id) => {
  const agent = await prisma.utilisateur.findUnique({ where: { id } });

  if (!agent) {
    throw new Error("AGENT_NOT_FOUND");
  }

  if (agent.role === "SUPER_ADMIN") {
    throw new Error("FORBIDDEN_SUPER_ADMIN");
  }

  return prisma.utilisateur.update({
    where: { id },
    data: { actif: !agent.actif },
  });
};

exports.deleteAgent = async (id) => {
  const agent = await prisma.utilisateur.findUnique({ where: { id } });

  if (!agent) {
    throw new Error("AGENT_NOT_FOUND");
  }

  if (agent.role === "SUPER_ADMIN") {
    throw new Error("FORBIDDEN_SUPER_ADMIN");
  }

  await prisma.workflowHistory.updateMany({
    where: { actorId: id },
    data: { actorId: null },
  });

  await prisma.utilisateur.delete({ where: { id } });
};

exports.sendMailToAgent = async (id, subject, body) => {
  const agent = await prisma.utilisateur.findUnique({ where: { id } });

  if (!agent) {
    throw new Error("AGENT_NOT_FOUND");
  }

  await emailService.sendCustomMessage(agent.email, subject, body);
};

async function sendWelcomeMail(agent, password) {
  // Non bloquant : un échec d'envoi (ex. template) ne doit pas faire échouer la création de l'agent.
  try {
    await emailService.sendWelcomeAgent(agent.email, agent.prenom, agent.nom, password);
  } catch (err) {
    console.error("Envoi email de bienvenue échoué :", err.message);
  }
}