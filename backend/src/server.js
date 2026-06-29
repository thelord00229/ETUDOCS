require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

const allowedOrigins = new Set(
  [
    process.env.FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ].filter(Boolean)
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) return callback(null, true);
      return callback(new Error(`Origin non autorisée par CORS: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Fichiers statiques ──
app.use("/uploads", express.static("uploads"));
app.use("/assets/logos", express.static(path.join(__dirname, "assets/logos")));

// ── Routes API ──
app.use("/api/auth", require("./modules/auth/auth.routes"));
app.use("/api/demandes", require("./modules/demande/demande.routes"));
app.use("/api/documents", require("./modules/document/document.routes"));
app.use("/api/admin", require("./modules/admin/admin.routes"));
app.use("/api/utilisateurs", require("./modules/utilisateur/utilisateur.routes"));
app.use("/api/agents", require("./modules/agent/agent.routes"));
app.use("/api/institutions", require("./modules/institution/institution.routes"));
app.use("/api/notifications", require("./modules/notification/notification.routes"));
app.use("/api/reclamations", require("./modules/reclamation/reclamation.routes"));

// Public verify (QR)
app.use("/verify", require("./modules/verify/verify.routes"));

// Route de test
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "EtuDocs backend opérationnel" });
});

// Gestion erreurs globale — toujours en dernier
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;

  // 5xx : on logge les détails côté serveur, on ne fuit rien au client
  if (status >= 500) {
    console.error(`[ERROR] ${req.method} ${req.originalUrl} —`, err.stack || err.message);
    return res.status(status).json({ message: "Erreur interne du serveur" });
  }

  // 4xx : erreurs métier → message explicite autorisé
  return res.status(status).json({ message: err.message || "Requête invalide" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 EtuDocs backend — port ${PORT}`);
});
