require('dotenv').config();
const prisma = require('../../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const emailService = require('../../services/email.service');

const genToken = (user) => jwt.sign(
  { id: user.id, role: user.role, institutionId: user.institutionId },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN }
);

exports.register = async ({ nom, prenom, email, password, numeroEtudiant, institutionId }) => {
  const existing = await prisma.utilisateur.findUnique({ where: { email } });
  if (existing) {
    const err = new Error('Cet email est déjà utilisé');
    err.statusCode = 400;
    throw err;
  }
  const hash = await bcrypt.hash(password, 12);
  const tokenVerification = crypto.randomBytes(32).toString('hex');
  await prisma.utilisateur.create({
    data: {
      nom, prenom, email, password: hash,
      role: 'ETUDIANT', numeroEtudiant, institutionId,
      tokenVerification, emailVerifie: false, actif: false
    }
  });
  await emailService.sendVerificationEmail(email, tokenVerification);
  return { message: 'Compte créé. Vérifiez votre email.' };
};

exports.login = async ({ email, password }) => {
  const user = await prisma.utilisateur.findUnique({ where: { email } });
  if (!user) {
    const err = new Error('Email ou mot de passe incorrect');
    err.statusCode = 401; throw err;
  }
  if (!user.emailVerifie) {
    const err = new Error('Email non vérifié');
    err.statusCode = 403; throw err;
  }
  if (!user.actif) {
    const err = new Error('Compte désactivé');
    err.statusCode = 403; throw err;
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    const err = new Error('Email ou mot de passe incorrect');
    err.statusCode = 401; throw err;
  }
  const token = genToken(user);
  return {
    token,
    user: {
      id: user.id, nom: user.nom, prenom: user.prenom,
      email: user.email, role: user.role,
      service: user.service, institutionId: user.institutionId
    }
  };
};

exports.verifyEmail = async (token) => {
  const user = await prisma.utilisateur.findFirst({ where: { tokenVerification: token } });
  if (!user) {
    const err = new Error('Token invalide'); err.statusCode = 400; throw err;
  }
  await prisma.utilisateur.update({
    where: { id: user.id },
    data: { emailVerifie: true, actif: true, tokenVerification: null }
  });
  return { message: 'Email vérifié. Vous pouvez vous connecter.' };
};

exports.requestPasswordReset = async (email) => {
  const user = await prisma.utilisateur.findUnique({ where: { email } });
  if (!user) return { message: 'Si cet email existe, un lien a été envoyé.' };
  const token = crypto.randomBytes(32).toString('hex');
  await prisma.utilisateur.update({
    where: { id: user.id },
    data: {
      tokenResetPassword: token,
      tokenResetExpiry: new Date(Date.now() + 3600000)
    }
  });
  await emailService.sendPasswordResetEmail(email, token);
  return { message: 'Si cet email existe, un lien a été envoyé.' };
};

exports.resetPassword = async (token, newPassword) => {
  const user = await prisma.utilisateur.findFirst({
    where: { tokenResetPassword: token, tokenResetExpiry: { gt: new Date() } }
  });
  if (!user) {
    const err = new Error('Token invalide ou expiré'); err.statusCode = 400; throw err;
  }
  const hash = await bcrypt.hash(newPassword, 12);
  await prisma.utilisateur.update({
    where: { id: user.id },
    data: { password: hash, tokenResetPassword: null, tokenResetExpiry: null }
  });
  return { message: 'Mot de passe réinitialisé.' };
};