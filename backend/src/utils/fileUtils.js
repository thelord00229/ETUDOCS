const path = require("path");

const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

/**
 * Convertit un chemin relatif ou absolu en chemin absolu sécurisé.
 * Retourne null si le chemin est en dehors du dossier uploads.
 */
function toSafeAbsolutePath(filePath) {
  if (!filePath) return null;
  const normalized = String(filePath).replace(/\\/g, "/");
  const abs = path.isAbsolute(normalized)
    ? path.resolve(normalized)
    : path.resolve(process.cwd(), normalized);

  if (!abs.startsWith(UPLOADS_DIR)) return null;
  return abs;
}

module.exports = { toSafeAbsolutePath };