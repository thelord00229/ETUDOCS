const prisma = require("../../config/prisma");
const { toSafeAbsolutePath } = require("../../utils/fileUtils");
const { assertPermission, getNextStatut } = require("../../modules/workflow/workflow");
const emailService = require("../../services/email.service");

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

function documentLabel(typeDocument) {
  if (typeDocument === "RELEVE_NOTES") return "Releve de notes";
  if (typeDocument === "ATTESTATION_INSCRIPTION") return "Attestation d'inscription";
  return "Document";
}

function toMailDocument(doc, typeDocument) {
  return {
    reference: doc.reference,
    filename: `${documentLabel(typeDocument)} - ${doc.reference}.pdf`,
    absPath: toSafeAbsolutePath(doc.urlPdf),
  };
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
    createdAt: doc.createdAt,
    deliveredAt: doc.deliveredAt || doc.demande.deliveredAt,
    serviceCible: doc.demande.serviceCible,
  }));
}

async function telecharger(reference, userId) {
  const doc = await prisma.document.findUnique({
    where: { reference },
    include: { demande: true },
  });

  if (!doc) return { error: { code: 404, message: "Document introuvable" } };

  if (doc.demande.utilisateurId !== userId) {
    return { error: { code: 403, message: "Acces refuse" } };
  }

  return { urlPdf: doc.urlPdf };
}

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

async function supprimer(reference, userId, userRole) {
  const doc = await getDocumentByReference(reference);
  if (!doc) return { error: { code: 404, message: "Document introuvable" } };

  if (doc.demande.utilisateurId !== userId && userRole !== "SUPER_ADMIN") {
    return { error: { code: 403, message: "Acces refuse" } };
  }

  const absPath = toSafeAbsolutePath(doc.urlPdf);
  await prisma.document.delete({ where: { id: doc.id } });

  return { absPath };
}

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

async function envoyerDocumentDisponible(documentId) {
  const deliveredDoc = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      demande: {
        include: {
          utilisateur: { select: { email: true, prenom: true } },
        },
      },
    },
  });

  if (!deliveredDoc?.demande?.utilisateur?.email) return;

  await emailService.sendDocumentDisponible(
    deliveredDoc.demande.utilisateur.email,
    deliveredDoc.demande.utilisateur.prenom,
    deliveredDoc.demande.typeDocument,
    [toMailDocument(deliveredDoc, deliveredDoc.demande.typeDocument)]
  );
}

async function avancerStatut(reference, action, userRole, userInstitutionId) {
  const doc = await getDocumentByReference(reference);
  if (!doc) return { error: { code: 404, message: "Document introuvable" } };

  if (
    userRole !== "SUPER_ADMIN" &&
    doc.demande.institutionId &&
    userInstitutionId &&
    doc.demande.institutionId !== userInstitutionId
  ) {
    return { error: { code: 403, message: "Acces refuse" } };
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

  if (updated.statut === "DISPONIBLE") {
    try {
      await envoyerDocumentDisponible(updated.id);
    } catch (e) {
      console.log("[EMAIL SKIPPED]", e.message);
    }
  }

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
