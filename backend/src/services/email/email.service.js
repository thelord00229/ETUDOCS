require("dotenv").config();
const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const fs = require("fs");

const FROM = process.env.MAIL_FROM || '"EtuDocs" <noreply@etudocs.uac.bj>';

const isDev = (process.env.NODE_ENV || "development") !== "production";

const hasSmtpConfig =
  !!process.env.SMTP_HOST &&
  !!process.env.SMTP_PORT &&
  !!process.env.SMTP_USER &&
  !!process.env.SMTP_PASS;

let transporter = null;

if (hasSmtpConfig) {
  const port = parseInt(process.env.SMTP_PORT, 10);
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465, // Resend: true sur 465, false sur 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
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
    console.warn("[WARN] SMTP non configuré en production. Configure SMTP_HOST/PORT/USER/PASS.");
  }
}

// Helper function to render email templates
const renderTemplate = async (templateName, data) => {
  const templatePath = path.join(__dirname, "templates", `${templateName}.ejs`);
  return await ejs.renderFile(templatePath, data);
};

// Send email asynchronously
const sendEmail = async (to, subject, html, options = {}) => {
  try {
    const message = {
      from: FROM,
      to,
      subject,
      html,
    };

    if (options.attachments?.length) {
      message.attachments = options.attachments;
    }

    await transporter.sendMail(message);
    console.log(`[EMAIL SENT] To: ${to} | Subject: ${subject}`);
    return true;
  } catch (error) {
    console.error(`[EMAIL ERROR] To: ${to} | Subject: ${subject} | Error: ${error.message}`);
    // Don't throw, just log
    return false;
  }
};

exports.sendVerificationEmail = async (email, token) => {
  const link = `${process.env.FRONTEND_URL}/auth/verify/${token}?email=${encodeURIComponent(email)}`;
  const html = await renderTemplate("verification", { link });
  await sendEmail(email, "Vérifiez votre email — EtuDocs", html);
};

exports.sendPasswordResetEmail = async (email, code) => {
  const html = await renderTemplate("password-reset", { code });
  await sendEmail(email, "Code de réinitialisation — EtuDocs", html);
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

exports.sendDocumentDisponible = async (email, prenom, typeDocument, documents = []) => {
  const reclamationUrl = `${process.env.FRONTEND_URL || ""}/dashboardEtu/reclamations`;
  const attachments = documents
    .filter((doc) => doc?.absPath && fs.existsSync(doc.absPath))
    .map((doc) => ({
      filename: doc.filename || `${doc.reference || "document"}.pdf`,
      path: doc.absPath,
      contentType: "application/pdf",
    }));

  const html = await renderTemplate("document-disponible", {
    prenom,
    typeDocument,
    documents,
    reclamationUrl,
  });

  return await sendEmail(email, "Votre document est prêt — EtuDocs", html, {
    attachments,
  });
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

/**
 * Mail de bienvenue à un agent nouvellement créé, avec ses identifiants.
 * @param {string} email
 * @param {string} prenom
 * @param {string} nom
 * @param {string} password - mot de passe temporaire
 */
exports.sendWelcomeAgent = async (email, prenom, nom, password) => {
  const loginUrl = process.env.FRONTEND_URL + "/login";
  const html = await renderTemplate("welcome-agent", { prenom, nom, email, password, loginUrl });
  await sendEmail(email, "Bienvenue sur EtuDocs — Vos identifiants de connexion", html);
};

/**
 * Mail libre envoyé manuellement à un agent par un administrateur.
 * @param {string} email
 * @param {string} subject
 * @param {string} body - texte brut (les sauts de ligne sont convertis en <br/>)
 */
exports.sendCustomMessage = async (email, subject, body) => {
  const html = await renderTemplate("custom-message", { subject, body });
  await sendEmail(email, subject, html);
};

exports.sendReclamationCreee = async (etudiantEmail, reclamationId) => {
  const html = await renderTemplate("reclamation-creee", { reclamationId });
  await sendEmail(etudiantEmail, "Reclamation recue - EtuDocs", html);
};

exports.sendReclamationPriseEnCharge = async (etudiantEmail, reclamationId, agentNom) => {
  const html = await renderTemplate("reclamation-prise-en-charge", {
    reclamationId,
    agentNom,
  });
  await sendEmail(etudiantEmail, "Reclamation prise en charge - EtuDocs", html);
};

exports.sendReclamationResolueDocRegenere = async (etudiantEmail, reclamationId, nouveauDocumentUrl) => {
  const html = await renderTemplate("reclamation-resolue-doc", {
    reclamationId,
    nouveauDocumentUrl,
  });
  await sendEmail(etudiantEmail, "Document corrige disponible - EtuDocs", html);
};

exports.sendReclamationResolueSansDoc = async (etudiantEmail, reclamationId, reponseAgent) => {
  const html = await renderTemplate("reclamation-resolue-sans-doc", {
    reclamationId,
    reponseAgent,
  });
  await sendEmail(etudiantEmail, "Reponse a votre reclamation - EtuDocs", html);
};

exports.sendReclamationRejetee = async (etudiantEmail, reclamationId, raison) => {
  const html = `<p>Votre reclamation ${reclamationId} a ete rejetee.</p><p>${raison || ""}</p>`;
  await sendEmail(etudiantEmail, "Reclamation rejetee - EtuDocs", html);
};
