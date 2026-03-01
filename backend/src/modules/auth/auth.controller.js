const authService = require('./auth.service');
const asyncHandler = require('../../utils/asyncHandler');
const bcrypt = require('bcryptjs');
const prisma = require('../../config/prisma');

exports.register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json(result);
});

exports.login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.json(result);
});

exports.verifyEmail = asyncHandler(async (req, res) => {
  const result = await authService.verifyEmail(req.params.token);
  res.json(result);
});

exports.requestReset = asyncHandler(async (req, res) => {
  const result = await authService.requestPasswordReset(req.body.email);
  res.json(result);
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword(req.params.token, req.body.newPassword);
  res.json(result);
});

// ✅ Changer le mot de passe (étudiant connecté)
exports.changePassword = asyncHandler(async (req, res) => {
  const { motDePasseActuel, nouveauMotDePasse } = req.body;

  if (!motDePasseActuel || !nouveauMotDePasse) {
    return res.status(400).json({ message: 'Tous les champs sont requis' });
  }
  if (nouveauMotDePasse.length < 8) {
    return res.status(400).json({ message: 'Le nouveau mot de passe doit contenir au moins 8 caractères' });
  }

  const user = await prisma.utilisateur.findUnique({ where: { id: req.user.id } });
  if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

  const valid = await bcrypt.compare(motDePasseActuel, user.password);
  if (!valid) return res.status(400).json({ message: 'Mot de passe actuel incorrect' });

  const hash = await bcrypt.hash(nouveauMotDePasse, 10);
  await prisma.utilisateur.update({ where: { id: user.id }, data: { password: hash } });

  res.json({ message: 'Mot de passe modifié avec succès' });
});