const authService = require("./auth.service");
const asyncHandler = require("../../utils/asyncHandler");

exports.register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json(result);
});

exports.login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.json(result);
});

exports.verifyEmail = asyncHandler(async (req, res) => {
  const result = await authService.verifyEmail(req.params.token, req.query.email);
  res.json(result);
});

exports.requestReset = asyncHandler(async (req, res) => {
  const result = await authService.requestPasswordReset(req.body.email);
  res.json(result);
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword(
    req.params.token,
    req.body.newPassword,
    req.query.email
  );
  res.json(result);
});

// ✅ Changer le mot de passe (utilisateur connecté)
exports.changePassword = asyncHandler(async (req, res) => {
  const { motDePasseActuel, nouveauMotDePasse } = req.body;
  const result = await authService.changePassword(
    req.user.id,
    motDePasseActuel,
    nouveauMotDePasse
  );
  res.json(result);
});