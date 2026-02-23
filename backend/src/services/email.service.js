require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST,
  port: parseInt(process.env.BREVO_SMTP_PORT),
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS
  }
});

const FROM = '"EtuDocs" <noreply@etudocs.uac.bj>';

const MESSAGES_STATUT = {
  TRANSMISE_SECRETAIRE_GENERAL:        'Votre demande a été reçue et transmise à la scolarité.',
  TRANSMISE_CHEF_DIVISION:             'Votre demande est en cours de vérification.',
  ATTENTE_SIGNATURE_DIRECTEUR_ADJOINT: 'Votre document a été généré, en attente de signature.',
  ATTENTE_SIGNATURE_DIRECTEUR:         'Votre document est en attente de la signature finale.',
  DISPONIBLE:                          'Votre document est prêt à télécharger.',
  REJETEE:                             'Votre demande a été rejetée.',
  CORRECTION_DEMANDEE:                 'Des corrections sont demandées sur votre dossier.'
};

exports.sendVerificationEmail = async (email, token) => {
  const link = `${process.env.FRONTEND_URL}/auth/verify/${token}`;
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: 'Vérifiez votre email — EtuDocs',
    html: `<p>Cliquez pour activer votre compte :</p>
           <a href="${link}">Vérifier mon email</a>
           <p>Lien valable 24h.</p>`
  });
};

exports.sendStatutChange = async (email, prenom, statut) => {
  const message = MESSAGES_STATUT[statut];
  if (!message) return;
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: 'Mise à jour de votre demande — EtuDocs',
    html: `<p>Bonjour ${prenom},</p>
           <p>${message}</p>
           <a href="${process.env.FRONTEND_URL}/dashboard">Accéder à mon espace</a>`
  });
};

exports.sendPasswordResetEmail = async (email, token) => {
  const link = `${process.env.FRONTEND_URL}/auth/reset-password/${token}`;
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: 'Réinitialisation de mot de passe — EtuDocs',
    html: `<p>Cliquez pour réinitialiser votre mot de passe :</p>
           <a href="${link}">Réinitialiser</a>
           <p>Expire dans 1h.</p>`
  });
};