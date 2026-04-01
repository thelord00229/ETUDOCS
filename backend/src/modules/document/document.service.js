const prisma = require("../../config/prisma");
const { assertPermission, getNextStatut } = require("../../modules/workflow/workflow");

/**
 * Requête partagée — récupère un document avec sa demande.
 * Utilisée dans plusieurs fonctions pour éviter la répétition.
 */
async function getDocumentByReference(reference) {
  return prisma.document.findUnique({
    where: { reference },
    include: { demande: true },
  });
}

/**
 * Téléchargement — vérifie le quota et incrémente le compteur.
 */
async function telecharger(reference, userId) {
  const DEFAULT_MAX_DOWNLOADS = 3;

  return prisma.$transaction(async (tx) => {
    const doc = await tx.document.findUnique({
      where: { reference },
      include: { demande: true },
    });

    if (!doc) return { error: { code: 404, message: "Document introuvable" } };

    if (doc.demande.utilisateurId !== userId) {
      return { error: { code: 403, message: "Accès refusé" } };
    }

    const maxDownloads = doc.maxDownloads ?? DEFAULT_MAX_DOWNLOADS;
    const current = doc.downloadCount ?? 0;

    if (current >= maxDownloads) {
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
        blockedAt: nextCount >= maxDownloads ? new Date() : doc.blockedAt,
      },
    });

    return { urlPdf: doc.urlPdf };
  });
}

/**
 * Prévisualisation — retourne le chemin PDF sans toucher au quota.
 */
async function preview(reference) {
  return getDocumentByReference(reference);
}

/**
 * Suppression — efface le document en base (le fichier est supprimé dans le controller).
 */
async function supprimer(reference) {
  const doc = await getDocumentByReference(reference);
  if (!doc) return null;

  await prisma.document.delete({ where: { id: doc.id } });
  return doc;
}

/**
 * Vérification publique via QR code.
 */
async function verifier(reference) {
  return prisma.document.findUnique({
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
}

/**
 * Avancer le statut d'une demande via un document (DA / Directeur).
 */
async function avancerStatut(reference, action, userRole, userInstitutionId) {
  const doc = await getDocumentByReference(reference);
  if (!doc) return { error: { code: 404, message: "Document introuvable" } };

  // Sécurité institution (sauf SUPER_ADMIN)
  if (
    userRole !== "SUPER_ADMIN" &&
    doc.demande.institutionId &&
    userInstitutionId &&
    doc.demande.institutionId !== userInstitutionId
  ) {
    return { error: { code: 403, message: "Accès refusé" } };
  }

  const currentStatut = doc.demande.statut;

  try {
    assertPermission({ role: userRole, statutActuel: currentStatut, action });
  } catch (e) {
    return { error: { code: 403, message: e.message } };
  }

  const nextStatut = getNextStatut({ role: userRole, statutActuel: currentStatut, action });

  const updated = await prisma.$transaction(async (tx) => {
    const demandeUpd = await tx.demande.update({
      where: { id: doc.demandeId },
      data: {
        statut: nextStatut,
        deliveredAt: nextStatut === "DISPONIBLE" ? new Date() : doc.demande.deliveredAt,
      },
    });

    if (nextStatut === "DISPONIBLE") {
      await tx.document.updateMany({
        where: { demandeId: doc.demandeId },
        data: { deliveredAt: new Date() },
      });
    }

    return demandeUpd;
  });

  return {
    success: true,
    reference,
    demandeId: doc.demandeId,
    previousStatut: currentStatut,
    nextStatut: updated.statut,
    deliveredAt: updated.deliveredAt,
  };
}

module.exports = {
  getDocumentByReference,
  telecharger,
  preview,
  supprimer,
  verifier,
  avancerStatut,
};