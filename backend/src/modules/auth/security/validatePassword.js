// src/modules/auth/security/validatePassword.js

/**
 * Valide un mot de passe selon les règles définies.
 * @param {string} password - Le mot de passe à valider.
 * @returns {boolean} - True si valide, sinon lève une erreur.
 * @throws {Error} - Erreur avec statusCode si invalide.
 */
function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    const err = new Error('Mot de passe requis.');
    err.statusCode = 400;
    throw err;
  }

  const manquants = [];
  if (password.length < 8) manquants.push('au moins 8 caractères');
  if (!/[A-Z]/.test(password)) manquants.push('une lettre majuscule');
  if (!/[^A-Za-z0-9]/.test(password)) manquants.push('un caractère spécial');

  if (manquants.length > 0) {
    const err = new Error(`Le mot de passe doit contenir ${manquants.join(', ')}.`);
    err.statusCode = 400;
    throw err;
  }

  return true;
}

module.exports = validatePassword;