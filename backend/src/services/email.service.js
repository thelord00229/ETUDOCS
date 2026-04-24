require("dotenv").config();
const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");

const FROM = '"EtuDocs" <noreply@etudocs.uac.bj>';

const MESSAGES_STATUT = {
  TRANSMISE_SECRETAIRE_GENERAL:        "Votre demande a été reçue et transmise à la scolarité.",
  TRANSMISE_CHEF_DIVISION:             "Votre demande est en cours de vérification.",
  ATTENTE_SIGNATURE_DIRECTEUR_ADJOINT: "Votre document a été généré, en attente de signature.",
  ATTENTE_SIGNATURE_DIRECTEUR:         "Votre document est en attente de la signature finale.",
  DISPONIBLE:                          "Votre document est prêt à télécharger.",
  REJETEE:                             "Votre demande a été rejetée.",
  CORRECTION_DEMANDEE:                 "Des corrections sont demandées sur votre dossier."
};

const isDev = (process.env.NODE_ENV || "development") !== "production";

const hasBrevoConfig =
  !!process.env.BREVO_SMTP_HOST &&
  !!process.env.BREVO_SMTP_PORT &&
  !!process.env.BREVO_SMTP_USER &&
  !!process.env.BREVO_SMTP_PASS;

let transporter = null;

if (hasBrevoConfig) {
  transporter = nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST,
    port: parseInt(process.env.BREVO_SMTP_PORT, 10),
    secure: false, // Brevo SMTP: généralement false sur 587
    auth: {
      user: process.env.BREVO_SMTP_USER,
      pass: process.env.BREVO_SMTP_PASS,
    },
  });
} else {
  // ✅ DEV fallback : pas d’exception, juste log
  transporter = {
    sendMail: async (opts) => {
      console.log("[EMAIL DEV SKIPPED] SMTP non configuré.");
      console.log("To:", opts.to, "| Subject:", opts.subject);
      return true;
    },
  };

  if (!isDev) {
    console.warn("[WARN] SMTP non configuré en production. Configure BREVO_SMTP_*.");
  }
}

// Helper function to render email templates
const renderTemplate = async (templateName, data) => {
  const templatePath = path.join(__dirname, "templates", "emails", `${templateName}.ejs`);
  return await ejs.renderFile(templatePath, data);
};

// Send email asynchronously
const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: FROM,
      to,
      subject,
      html,
    });
    console.log(`[EMAIL SENT] To: ${to} | Subject: ${subject}`);
  } catch (error) {
    console.error(`[EMAIL ERROR] To: ${to} | Subject: ${subject} | Error: ${error.message}`);
    // Don't throw, just log
  }
};

exports.sendVerificationEmail = async (email, token) => {
  const link = `${process.env.FRONTEND_URL}/auth/verify/${token}?email=${encodeURIComponent(email)}`;
  const html = await renderTemplate("verification", { link });
  await sendEmail(email, "Vérifiez votre email — EtuDocs", html);
};

exports.sendStatutChange = async (email, prenom, statut) => {
  const message = MESSAGES_STATUT[statut];
  if (!message) return;
  const dashboardUrl = process.env.FRONTEND_URL + "/dashboard";
  const html = await renderTemplate("statut-change", { prenom, message, dashboardUrl });
  await sendEmail(email, "Mise à jour de votre demande — EtuDocs", html);
};

exports.sendPasswordResetEmail = async (email, token) => {
  const link = `${process.env.FRONTEND_URL}/auth/reset-password/${token}?email=${encodeURIComponent(email)}`;
  const html = await renderTemplate("password-reset", { link });
  await sendEmail(email, "Réinitialisation de mot de passe — EtuDocs", html);
};

exports.sendDemandeConfirmee = async (email, prenom, reference, typeDocument) => {
  const dashboardUrl = process.env.FRONTEND_URL + "/dashboard";
  const html = await renderTemplate("demande-confirmee", { prenom, reference, typeDocument, dashboardUrl });
  await sendEmail(email, "Demande reçue — EtuDocs", html);
};

exports.sendDemandeRejetee = async (email, prenom, typeDocument, motif) => {
  const dashboardUrl = process.env.FRONTEND_URL + "/dashboard";
  const html = await renderTemplate("demande-rejetee", { prenom, typeDocument, motif, dashboardUrl });
  await sendEmail(email, "Demande refusée — EtuDocs", html);
};

exports.sendDocumentDisponible = async (email, prenom, typeDocument) => {
  const dashboardUrl = process.env.FRONTEND_URL + "/dashboard";
  const html = await renderTemplate("document-disponible", { prenom, typeDocument, dashboardUrl });
  await sendEmail(email, "Votre document est prêt — EtuDocs", html);
};

exports.sendAgentNotification = async (email, prenom, role, nbDossiers) => {
  if (nbDossiers === 0) return;

  const sujet = nbDossiers === 1
    ? "Nouveau dossier à traiter — EtuDocs"
    : `${nbDossiers} dossiers vous attendent — EtuDocs`;

  const message = nbDossiers === 1
    ? "Un nouveau dossier vous a été assigné."
    : `${nbDossiers} dossiers vous attendent pour traitement.`;

  const dashboardUrl = process.env.FRONTEND_URL + "/dashboard";
  const html = await renderTemplate("agent-notification", { prenom, sujet, message, nbDossiers, dashboardUrl });
  await sendEmail(email, sujet, html);
};