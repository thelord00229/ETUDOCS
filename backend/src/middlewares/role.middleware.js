// src/middlewares/role.middleware.js

const normalizeRole = (v) => String(v || "").trim().toUpperCase();

module.exports = (...allowedRoles) => {
  const allowed = new Set(allowedRoles.map(normalizeRole));

  return (req, res, next) => {
    // Auth obligatoire avant role middleware
    if (!req.user) {
      return res.status(401).json({ message: "Authentification requise" });
    }

    const userRole = normalizeRole(req.user.role);

    if (!userRole || !allowed.has(userRole)) {
      return res
        .status(403)
        .json({ message: "Accès refusé : permissions insuffisantes" });
    }

    next();
  };
};