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

  if (password.length < 8) {
    const err = new Error('Mot de passe trop court (minimum 8 caractères).');
    err.statusCode = 400;
    throw err;
  }

  // Extensible : ajouter d'autres règles ici si nécessaire
  // Ex: au moins une majuscule, un chiffre, etc.

  return true;
}

module.exports = validatePassword;