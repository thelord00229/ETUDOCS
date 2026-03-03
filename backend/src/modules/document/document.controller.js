const prisma = require("../../config/prisma");
const path = require("path");
const fs = require("fs");
const asyncHandler = require("../../utils/asyncHandler");

const DEFAULT_MAX_DOWNLOADS = 3;

const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

function toSafeAbsolutePath(filePath) {
  if (!filePath) return null;
  const normalized = String(filePath).replace(/\\/g, "/");
  const abs = path.isAbsolute(normalized)
    ? path.resolve(normalized)
    : path.resolve(process.cwd(), normalized);
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

  const absPath = toSafeAbsolutePath(result.urlPdf);
  if (!absPath || !fs.existsSync(absPath)) {
    return res.status(404).json({ message: "Fichier PDF introuvable sur le serveur" });
  }

  return res.download(absPath, `${reference}.pdf`);
});

// ✅ NOUVEAU : preview inline sans téléchargement ni compteur
exports.preview = asyncHandler(async (req, res) => {
  const { reference } = req.params;

  const doc = await prisma.document.findUnique({
    where: { reference },
    include: { demande: true },
  });

  if (!doc) return res.status(404).json({ message: "Document introuvable" });

  const absPath = toSafeAbsolutePath(doc.urlPdf);
  if (!absPath || !fs.existsSync(absPath)) {
    return res.status(404).json({ message: "Fichier PDF introuvable sur le serveur" });
  }

  // inline = affiché dans le navigateur, pas téléchargé
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${reference}.pdf"`);
  // Empêche la mise en cache et le téléchargement direct
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");

  fs.createReadStream(absPath).pipe(res);
});

exports.supprimer = asyncHandler(async (req, res) => {
  const { reference } = req.params;

  const doc = await prisma.document.findUnique({
    where: { reference },
    include: { demande: true },
  });

  if (!doc) {
    return res.status(404).json({ message: "Document introuvable" });
  }

  if (doc.demande.utilisateurId !== req.user.id) {
    return res.status(403).json({ message: "Accès refusé" });
  }

  const absPath = toSafeAbsolutePath(doc.urlPdf);

  await prisma.document.delete({ where: { id: doc.id } });

  if (absPath && fs.existsSync(absPath)) {
    try { fs.unlinkSync(absPath); } catch { /* silencieux */ }
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