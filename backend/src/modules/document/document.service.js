const prisma = require("../../config/prisma");
const { toSafeAbsolutePath } = require("../../utils/fileUtils");
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

function parseSemestresFromReference(reference) {
  const match = String(reference || "").match(/_S([0-9-]+)(?=_)/);
  if (!match) return [];
  return match[1]
    .split("-")
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));
}

async function listerPourUtilisateur(userId) {
  const documents = await prisma.document.findMany({
    where: { demande: { utilisateurId: userId } },
    include: {
      demande: {
        include: {
          utilisateur: {
            select: {
              niveau: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return documents.map((doc) => ({
    id: doc.id,
    reference: doc.reference,
    typeDocument: doc.demande.typeDocument,
    semestres: parseSemestresFromReference(doc.reference).length
      ? parseSemestresFromReference(doc.reference)
      : doc.demande.semestres,
    anneeAcademique: doc.demande.anneeAcademique,
    niveau: doc.demande.utilisateur?.niveau || null,
    statut: doc.demande.statut || doc.statut,
    urlPdf: doc.urlPdf,
    downloadCount: doc.downloadCount,
    maxDownloads: doc.maxDownloads,
    qrPayload: doc.qrPayload,
    createdAt: doc.createdAt,
    deliveredAt: doc.deliveredAt || doc.demande.deliveredAt,
    serviceCible: doc.demande.serviceCible,
  }));
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

function getAggregateDemandeStatus(documents) {
  const statuses = documents.map((doc) => doc.statut);

  if (statuses.includes("DOCUMENT_GENERE")) return "DOCUMENT_GENERE";
  if (statuses.includes("ATTENTE_SIGNATURE_DIRECTEUR")) {
    return "ATTENTE_SIGNATURE_DIRECTEUR";
  }
  if (statuses.includes("DISPONIBLE")) return "DISPONIBLE";
  if (statuses.length > 0 && statuses.every((status) => status === "REJETEE")) {
    return "REJETEE";
  }

  return null;
}

/**
 * Suppression — efface le document en base (le fichier est supprimé dans le controller).
 */
async function supprimer(reference, userId, userRole) {
  const doc = await getDocumentByReference(reference);
  if (!doc) return { error: { code: 404, message: "Document introuvable" } };

  if (doc.demande.utilisateurId !== userId && userRole !== "SUPER_ADMIN") {
    return { error: { code: 403, message: "Accès refusé" } };
  }

  const absPath = toSafeAbsolutePath(doc.urlPdf);
  await prisma.document.delete({ where: { id: doc.id } });

  return { absPath };
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

  const currentStatut = doc.statut || doc.demande.statut;

  try {
    assertPermission({ role: userRole, statutActuel: currentStatut, action });
  } catch (e) {
    return { error: { code: 403, message: e.message } };
  }

  const nextStatut = getNextStatut({ role: userRole, statutActuel: currentStatut, action });

  const updated = await prisma.$transaction(async (tx) => {
    const now = new Date();

    const documentUpd = await tx.document.update({
      where: { id: doc.id },
      data: {
        statut: nextStatut,
        deliveredAt: nextStatut === "DISPONIBLE" ? now : doc.deliveredAt,
      },
    });

    const siblingDocs = await tx.document.findMany({
      where: { demandeId: doc.demandeId },
      select: { statut: true },
    });
    const demandeStatut = getAggregateDemandeStatus(siblingDocs);

    if (demandeStatut) {
      await tx.demande.update({
        where: { id: doc.demandeId },
        data: {
          statut: demandeStatut,
          deliveredAt:
            demandeStatut === "DISPONIBLE" ? now : doc.demande.deliveredAt,
        },
      });
    }

    return documentUpd;
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
  listerPourUtilisateur,
  telecharger,
  preview,
  supprimer,
  verifier,
  avancerStatut,
};
