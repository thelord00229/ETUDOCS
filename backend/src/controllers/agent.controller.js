// src/controllers/agent.controller.js

const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const { PrismaClient } = require("@prisma/client"); // adapter selon votre ORM
const prisma = new PrismaClient();

const DEFAULT_PASSWORD = "Password123!";

/* ─────────────────────────────────────────────
   GET /api/agents
   Retourne tous les utilisateurs qui ne sont
   pas SUPER_ADMIN, avec leur institution.
───────────────────────────────────────────── */
exports.getAgents = async (req, res) => {
  try {
    const agents = await prisma.utilisateur.findMany({
      where: { role: { not: "SUPER_ADMIN" } },
      include: { institution: { select: { id: true, nom: true, sigle: true } } },
      orderBy: { createdAt: "desc" },
    });
    return res.json(agents);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

/* ─────────────────────────────────────────────
   POST /api/agents
   Crée un compte agent avec mot de passe par défaut.
───────────────────────────────────────────── */
exports.createAgent = async (req, res) => {
  const { nom, prenom, email, role, institutionId, service } = req.body;

  if (!nom || !prenom || !email || !role) {
    return res.status(400).json({
      message: "Champs obligatoires manquants (nom, prenom, email, role)"
    });
  }

  if (role === "SUPER_ADMIN") {
    return res.status(403).json({
      message: "Impossible de créer un SUPER_ADMIN ici"
    });
  }

  // 🔥 Validation spéciale Chef Division
  if (role === "CHEF_DIVISION" && !service) {
    return res.status(400).json({
      message: "Le service est obligatoire pour un Chef de division"
    });
  }

  try {
    const existing = await prisma.utilisateur.findUnique({
      where: { email }
    });

    if (existing) {
      return res.status(409).json({
        message: "Un compte avec cet email existe déjà"
      });
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
          select: { id: true, nom: true, sigle: true }
        }
      }
    });

    await sendWelcomeMail(agent, DEFAULT_PASSWORD);

    return res.status(201).json(agent);

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Erreur lors de la création du compte"
    });
  }
};

/* ─────────────────────────────────────────────
   PATCH /api/agents/:id/toggle
   Active ou désactive un agent.
   Un agent inactif ne peut plus se connecter
   (contrôlé dans le middleware d'auth).
───────────────────────────────────────────── */
exports.toggleAgentActif = async (req, res) => {
  const { id } = req.params;
  try {
    const agent = await prisma.utilisateur.findUnique({ where: { id } });
    if (!agent) return res.status(404).json({ message: "Agent introuvable" });
    if (agent.role === "SUPER_ADMIN") {
      return res.status(403).json({ message: "Impossible de modifier un SUPER_ADMIN" });
    }

    const updated = await prisma.utilisateur.update({
      where: { id },
      data: { actif: !agent.actif },
    });

    return res.json({ id: updated.id, actif: updated.actif });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

/* ─────────────────────────────────────────────
   DELETE /api/agents/:id
   Supprime le compte agent.
   Les WorkflowHistory liées sont conservées
   (ON DELETE SET NULL ou champ actorId nullable).
───────────────────────────────────────────── */
exports.deleteAgent = async (req, res) => {
  const { id } = req.params;
  try {
    const agent = await prisma.utilisateur.findUnique({ where: { id } });
    if (!agent) return res.status(404).json({ message: "Agent introuvable" });
    if (agent.role === "SUPER_ADMIN") {
      return res.status(403).json({ message: "Impossible de supprimer un SUPER_ADMIN" });
    }

    // Nullifier les références dans WorkflowHistory pour conserver la traçabilité
    await prisma.workflowHistory.updateMany({
      where: { actorId: id },
      data: { actorId: null },
    });

    await prisma.utilisateur.delete({ where: { id } });

    return res.json({ message: "Agent supprimé avec succès" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur lors de la suppression" });
  }
};

/* ─────────────────────────────────────────────
   POST /api/agents/:id/email
   Envoie un email à l'agent depuis le Super Admin.
───────────────────────────────────────────── */
exports.sendMailToAgent = async (req, res) => {
  const { id } = req.params;
  const { subject, body } = req.body;

  if (!subject || !body) {
    return res.status(400).json({ message: "Objet et message requis" });
  }

  try {
    const agent = await prisma.utilisateur.findUnique({ where: { id } });
    if (!agent) return res.status(404).json({ message: "Agent introuvable" });

    const transporter = nodemailer.createTransporter({
      host:   process.env.SMTP_HOST,
      port:   parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from:    `"EtuDocs" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to:      agent.email,
      subject: subject,
      html:    `<p>${body.replace(/\n/g, "<br/>")}</p>`,
    });

    return res.json({ message: "Email envoyé avec succès" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur lors de l'envoi de l'email" });
  }
};

/* ─── Helper : email de bienvenue ─── */
async function sendWelcomeMail(agent, password) {
  try {
    const transporter = nodemailer.createTransporter({
      host:   process.env.SMTP_HOST,
      port:   parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
      from:    `"EtuDocs" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to:      agent.email,
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
    // On ne bloque pas la création si l'email échoue
    console.error("Envoi email de bienvenue échoué :", err.message);
  }
}