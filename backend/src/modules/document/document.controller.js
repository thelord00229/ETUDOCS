const prisma = require("../../config/prisma");
const path = require("path");
const fs = require("fs");
const asyncHandler = require("../../utils/asyncHandler");

const DEFAULT_MAX_DOWNLOADS = 3;

// 🔒 Dossier racine autorisé (adapte selon ton projet)
const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

function toSafeAbsolutePath(filePath) {
  if (!filePath) return null;
  const normalized = String(filePath).replace(/\\/g, "/");

  // Si tu stockes déjà un chemin absolu, on le garde mais on sécurise
  const abs = path.isAbsolute(normalized)
    ? path.resolve(normalized)
    : path.resolve(process.cwd(), normalized);

  // Empêche de sortir de /uploads
  if (!abs.startsWith(UPLOADS_DIR)) return null;
  return abs;
}

exports.telecharger = asyncHandler(async (req, res) => {
  const { reference } = req.params;

  const result = await prisma.$transaction(async (tx) => {
    const doc = await tx.document.findUnique({
      where: { reference },
      include: { demande: true },
    });

    if (!doc) return { error: { code: 404, message: "Document introuvable" } };

    if (doc.demande.utilisateurId !== req.user.id) {
      return { error: { code: 403, message: "Accès refusé" } };
    }

    const maxDownloadsAllowed = doc.maxDownloads ?? DEFAULT_MAX_DOWNLOADS;
    const current = doc.downloadCount ?? 0;

    if (current >= maxDownloadsAllowed) {
      return {
        error: {
          code: 403,
          message: "Limite de téléchargement atteinte. Faites une nouvelle demande.",
        },
      };
    }

    const nextCount = current + 1;

    await tx.document.update({
      where: { id: doc.id },
      data: {
        downloadCount: { increment: 1 },
        blockedAt: nextCount >= maxDownloadsAllowed ? new Date() : doc.blockedAt,
      },
    });

    return { urlPdf: doc.urlPdf };
  });

  if (result?.error) {
    return res.status(result.error.code).json({ message: result.error.message });
  }

  // ✅ utilise la sécurité de chemin que tu as déjà écrite
  const absPath = toSafeAbsolutePath(result.urlPdf);
  if (!absPath || !fs.existsSync(absPath)) {
    return res.status(404).json({ message: "Fichier PDF introuvable sur le serveur" });
  }

  return res.download(absPath, `${reference}.pdf`);
});

/**
 * ⚠️ Je te conseille de ne plus exposer ça à l'étudiant.
 * Si tu veux le garder, limite-le à SUPER_ADMIN par middleware.
 */
exports.supprimer = asyncHandler(async (req, res) => {
  const { reference } = req.params;

  const doc = await prisma.document.findUnique({
    where: { reference },
    include: { demande: true },
  });

  if (!doc) {
    return res.status(404).json({ message: "Document introuvable" });
  }

  // ✅ Si tu veux le garder pour l'étudiant : ok.
  // Sinon: remplace par un check role SUPER_ADMIN ici.
  if (doc.demande.utilisateurId !== req.user.id) {
    return res.status(403).json({ message: "Accès refusé" });
  }

  const absPath = toSafeAbsolutePath(doc.urlPdf);

  // Supprimer le document en base
  await prisma.document.delete({ where: { id: doc.id } });

  // Puis supprimer le fichier si safe
  if (absPath && fs.existsSync(absPath)) {
    try {
      fs.unlinkSync(absPath);
    } catch {
      // silencieux
    }
  }

  res.json({ success: true, message: "Document supprimé" });
});

exports.verifier = asyncHandler(async (req, res) => {
  const { reference } = req.params;

  const doc = await prisma.document.findUnique({
    where: { reference },
    include: {
      demande: {
        include: {
          utilisateur: { select: { nom: true, prenom: true } },
          institution: { select: { nom: true, sigle: true } },
        },
      },
    },
  });

  if (!doc) {
    return res.json({ valide: false, message: "Document non reconnu" });
  }

  const u = doc.demande.utilisateur;

  // Masquage plus lisible (évite les noms très courts bizarres)
  const nom = String(u.nom || "");
  const prenom = String(u.prenom || "");
  const masked =
    nom.length <= 2
      ? `${prenom} ${nom.charAt(0)}*`
      : `${prenom} ${nom.charAt(0)}${"*".repeat(nom.length - 2)}${nom.slice(-1)}`;

  res.json({
    valide: true,
    reference: doc.reference,
    typeDocument: doc.demande.typeDocument,
    institution: doc.demande.institution.nom,
    sigle: doc.demande.institution.sigle,
    dateGeneration: doc.createdAt,
    nomMasque: masked,
  });
});