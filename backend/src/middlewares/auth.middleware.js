// src/middlewares/auth.middleware.js

const jwt = require("jsonwebtoken");

function getBearerToken(req) {
  const header = req.headers.authorization;
  if (!header) return null;
  if (!header.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  return token || null;
}

module.exports = (req, res, next) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    // Erreur serveur: config manquante
    return res.status(500).json({ message: "Configuration serveur invalide" });
  }

  const token = getBearerToken(req);

  if (!token) {
    return res.status(401).json({ message: "Authentification requise" });
  }

  try {
    const payload = jwt.verify(token, secret);

    // Sécurité minimale : payload doit contenir id + role
    if (!payload || !payload.id || !payload.role) {
      return res.status(401).json({ message: "Token invalide ou expiré" });
    }

    // Normalisation légère
    payload.role = String(payload.role).trim().toUpperCase();

    req.user = payload;
    return next();
  } catch (e) {
    return res.status(401).json({ message: "Token invalide ou expiré" });
  }
};