// src/middlewares/rateLimit.middleware.js

const rateLimit = require('express-rate-limit');

// Middleware pour limiter les tentatives de connexion
const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives par fenêtre
  message: {
    error: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Ne compte pas les succès
});

// Middleware pour limiter les demandes de réinitialisation de mot de passe
const resetPasswordRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 tentatives par fenêtre
  message: {
    error: 'Trop de demandes de réinitialisation. Réessayez dans 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware pour limiter les tentatives de saisie du code de réinitialisation
const verifyResetCodeRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 essais de code par fenêtre
  message: {
    error: 'Trop de tentatives. Réessayez dans 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Ne compte pas les succès
});

module.exports = {
  loginRateLimit,
  resetPasswordRateLimit,
  verifyResetCodeRateLimit,
};