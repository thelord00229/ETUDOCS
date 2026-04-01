const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const prisma = require("../../config/prisma");

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

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"EtuDocs" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: agent.email,
    subject,
    html: `<p>${body.replace(/\n/g, "<br/>")}</p>`,
  });
};

async function sendWelcomeMail(agent, password) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"EtuDocs" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: agent.email,
      subject: "Bienvenue sur EtuDocs — Vos identifiants de connexion",
      html: `
        <h2>Bienvenue sur EtuDocs, ${agent.prenom} ${agent.nom} !</h2>
        <p>Un compte a été créé pour vous sur la plateforme EtuDocs.</p>
        <p><strong>Email :</strong> ${agent.email}</p>
        <p><strong>Mot de passe temporaire :</strong> <code>${password}</code></p>
        <p>Connectez-vous et modifiez votre mot de passe depuis votre tableau de bord.</p>
        <p>— L'équipe EtuDocs</p>
      `,
    });
  } catch (err) {
    console.error("Envoi email de bienvenue échoué :", err.message);
  }
}