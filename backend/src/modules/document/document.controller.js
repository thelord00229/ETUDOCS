const prisma = require("../../config/prisma");
const path = require("path");
const fs = require("fs");
const asyncHandler = require("../../utils/asyncHandler");
const { assertPermission, getNextStatut } = require("../../utils/workflow");

const DEFAULT_MAX_DOWNLOADS = 3;
const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

function toSafeAbsolutePath(filePath) {
  if (!filePath) return null;
  const normalized = String(filePath).replace(/\\/g, "/");
  const abs = path.isAbsolute(normalized)
    ? path.resolve(normalized)
    : path.resolve(process.cwd(), normalized);

  // Sécurité: on autorise seulement dans /uploads
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

    // Propriétaire uniquement
    if (doc.demande.utilisateurId !== req.user.id) {
      return { error: { code: 403, message: "Accès refusé" } };
    }

    const maxDownloadsAllowed = doc.maxDownloads ?? DEFAULT_MAX_DOWNLOADS;
    const current = doc.downloadCount ?? 0;

    if (current >= maxDownloadsAllowed) {
      return {
        error: {
          code: 403,
          message:
            "Limite de téléchargement atteinte. Faites une nouvelle demande.",
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
    return res
      .status(404)
      .json({ message: "Fichier PDF introuvable sur le serveur" });
  }

  return res.download(absPath, `${reference}.pdf`);
});

exports.preview = asyncHandler(async (req, res) => {
  const { reference } = req.params;

  const doc = await prisma.document.findUnique({
    where: { reference },
    include: { demande: true },
  });

  if (!doc) return res.status(404).json({ message: "Document introuvable" });

  const absPath = toSafeAbsolutePath(doc.urlPdf);
  if (!absPath || !fs.existsSync(absPath)) {
    return res
      .status(404)
      .json({ message: "Fichier PDF introuvable sur le serveur" });
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${reference}.pdf"`);
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

  // Ici tu avais "propriétaire uniquement" :
  // si tu veux que seul SUPER_ADMIN supprime, laisse la route côté routes avec role("SUPER_ADMIN")
  if (doc.demande.utilisateurId !== req.user.id && req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({ message: "Accès refusé" });
  }

  const absPath = toSafeAbsolutePath(doc.urlPdf);

  await prisma.document.delete({ where: { id: doc.id } });

  if (absPath && fs.existsSync(absPath)) {
    try {
      fs.unlinkSync(absPath);
    } catch {}
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
      : `${prenom} ${nom.charAt(0)}${"*".repeat(nom.length - 2)}${nom.slice(
          -1
        )}`;

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


exports.avancerParReference = asyncHandler(async (req, res) => {
  const { reference } = req.params;
  const action = String(req.body?.action || "").trim().toUpperCase();

  if (!reference) return res.status(400).json({ message: "reference requise" });
  if (!action) return res.status(400).json({ message: "action requise" });

  const allowed = new Set(["APPROUVER", "REJETER"]);
  if (!allowed.has(action)) {
    return res.status(400).json({ message: "action invalide (APPROUVER | REJETER)" });
  }

  const userRole = req.user.role;

  // On récupère le document + sa demande
  const doc = await prisma.document.findUnique({
    where: { reference },
    include: { demande: true },
  });

  if (!doc) return res.status(404).json({ message: "Document introuvable" });

  // Sécurité institution (sauf SUPER_ADMIN)
  if (
    userRole !== "SUPER_ADMIN" &&
    doc.demande.institutionId &&
    req.user.institutionId &&
    doc.demande.institutionId !== req.user.institutionId
  ) {
    return res.status(403).json({ message: "Accès refusé" });
  }

  
  const currentStatut = doc.demande.statut;

  try {
    assertPermission({ role: userRole, statutActuel: currentStatut, action });
  } catch (e) {
    return res.status(403).json({ message: e.message });
  }

  const nextStatut = getNextStatut({ role: userRole, statutActuel: currentStatut, action });

  const updated = await prisma.$transaction(async (tx) => {
    // 1) update demande
    const demandeUpd = await tx.demande.update({
      where: { id: doc.demandeId },
      data: {
        statut: nextStatut,
        deliveredAt: nextStatut === "DISPONIBLE" ? new Date() : doc.demande.deliveredAt,
      },
    });

    // 2) si disponible, on peut marquer tous les documents "deliveredAt"
    if (nextStatut === "DISPONIBLE") {
      await tx.document.updateMany({
        where: { demandeId: doc.demandeId },
        data: { deliveredAt: new Date() },
      });
    }

    return demandeUpd;
  });

  return res.json({
    success: true,
    reference,
    demandeId: doc.demandeId,
    previousStatut: currentStatut,
    nextStatut: updated.statut,
    deliveredAt: updated.deliveredAt,
  });
});