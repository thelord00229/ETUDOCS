// Règles de mot de passe — miroir exact de
// backend/src/modules/auth/security/validatePassword.js
// (toute évolution doit être répercutée des deux côtés)

export const PASSWORD_RULES = [
  { key: "length", label: "Au moins 8 caractères", test: (p) => p.length >= 8 },
  { key: "upper", label: "Au moins une majuscule", test: (p) => /[A-Z]/.test(p) },
  {
    key: "special",
    label: "Au moins un caractère spécial",
    test: (p) => /[^A-Za-z0-9]/.test(p),
  },
];

/**
 * Indique si un mot de passe respecte toutes les règles.
 * @param {string} p
 * @returns {boolean}
 */
export const isPasswordValid = (p) =>
  PASSWORD_RULES.every((r) => r.test(String(p || "")));

/**
 * Force indicative (0..3) = nombre de règles satisfaites.
 * @param {string} p
 * @returns {number}
 */
export const passwordStrength = (p) =>
  p ? PASSWORD_RULES.filter((r) => r.test(String(p))).length : 0;
