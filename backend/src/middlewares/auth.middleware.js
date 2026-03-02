// src/middlewares/auth.middleware.js

const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client"); // adapter selon votre ORM
const prisma = new PrismaClient();

function getBearerToken(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  return token || null;
}

module.exports = async (req, res, next) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return res.status(500).json({ message: "Configuration serveur invalide" });
  }

  const token = getBearerToken(req);

  if (!token) {
    return res.status(401).json({ message: "Authentification requise" });
  }

  try {
    const payload = jwt.verify(token, secret);

    if (!payload || !payload.id || !payload.role) {
      return res.status(401).json({ message: "Token invalide ou expiré" });
    }

    // ── Vérification en base : le compte est-il encore actif ? ──
    const user = await prisma.utilisateur.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        role: true,
        actif: true,
        institutionId: true,
        service: true,
        email: true,
        nom: true,
        prenom: true,
      },
    });

    if (!user) return res.status(401).json({ message: "Compte introuvable" });
    if (!user.actif) {
      return res.status(403).json({ message: "Votre compte a été désactivé. Contactez l'administrateur." });
    }

    // Normalisation
    payload.role = String(payload.role).trim().toUpperCase();

    req.user = {
      id: user.id,
      role: String(user.role || "").trim().toUpperCase(),
      institutionId: user.institutionId,
      service: user.service, // EXAMENS / SCOLARITE pour CHEF_DIVISION
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
    };
    return next();
  } catch (e) {
    return res.status(401).json({ message: "Token invalide ou expiré" });
  }
};