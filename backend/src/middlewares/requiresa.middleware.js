// src/middlewares/requireSA.middleware.js

module.exports = (req, res, next) => {
  if (!req.user || req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({ message: "Accès réservé au Super Admin" });
  }
  return next();
};