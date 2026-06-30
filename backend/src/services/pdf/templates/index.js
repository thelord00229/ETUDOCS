/**
 * Routeur de templates — retourne la config de l'institution demandée.
 * Quand tu ajoutes une nouvelle institution, tu crées son fichier
 * dans /institutions/ et tu l'enregistres ici.
 */

const ifri = require("./institutions/ifri.template");

const CONFIGS = {
  IFRI: ifri,
};

/**
 * Retourne la config d'une institution par son sigle.
 * Si l'institution n'est pas trouvée, retourne IFRI par défaut.
 */
function getInstitutionConfig(sigle) {
  const key = String(sigle || "").trim().toUpperCase();
  return CONFIGS[key] || CONFIGS["IFRI"];
}

/**
 * Enregistre une nouvelle institution dynamiquement.
 * Utile pour les tests ou l'ajout futur via le SUPER_ADMIN.
 */
function registerInstitution(sigle, config) {
  const key = String(sigle || "").trim().toUpperCase();
  CONFIGS[key] = config;
}

module.exports = { getInstitutionConfig, registerInstitution };