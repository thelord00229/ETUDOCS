const path = require("path");
const prisma = require("../../config/prisma");
const pdfService = require("../../services/pdf.service");
const qrcodeService = require("../../services/qrcode.service");
const emailService = require("../../services/email.service");
const { toSafeAbsolutePath } = require("../../utils/fileUtils");

const AGENT_ROLES = new Set(["SECRETAIRE_GENERAL", "CHEF_DIVISION", "SUPER_ADMIN"]);
const RESOLUTION_ACTIONS = new Set(["REGENERER_DOC", "EXPLIQUER"]);

const normalize = (value) => String(value || "").trim();
const normalizeUpper = (value) => normalize(value).toUpperCase();

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

function assertAgent(user) {
  if (!AGENT_ROLES.has(user?.role)) {
    const err = new Error("Acces refuse : agent non autorise");
    err.statusCode = 403;
    throw err;
  }
}

async function getDocumentForStudent(documentId, etudiantId) {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      demande: {
        include: {
          utilisateur: true,
          institution: true,
        },
      },
    },
  });

  if (!document) {
    const err = new Error("Document introuvable");
    err.statusCode = 404;
    throw err;
  }

  if (document.demande.utilisateurId !== etudiantId) {
    const err = new Error("Acces refuse : document non proprietaire");
    err.statusCode = 403;
    throw err;
  }

  return document;
}

async function assertReclamationAccess(reclamation, user) {
  if (user.role === "ETUDIANT" && reclamation.etudiantId !== user.id) {
    const err = new Error("Acces refuse");
    err.statusCode = 403;
    throw err;
  }

  if (user.role !== "ETUDIANT" && user.role !== "SUPER_ADMIN") {
    if (!AGENT_ROLES.has(user.role)) {
      const err = new Error("Acces refuse");
      err.statusCode = 403;
      throw err;
    }
    const inst = reclamation.document?.demande?.institutionId;
    if (inst && user.institutionId && inst !== user.institutionId) {
      const err = new Error("Acces refuse : institution differente");
      err.statusCode = 403;
      throw err;
    }
  }
}

function includeFull() {
  return {
    etudiant: { select: { id: true, nom: true, prenom: true, email: true, niveau: true } },
    traitePar: { select: { id: true, nom: true, prenom: true, email: true } },
    document: {
      select: {
        id: true,
        reference: true,
        urlPdf: true,
        createdAt: true,
        deliveredAt: true,
        statut: true,
        demande: { select: { typeDocument: true, institutionId: true, semestres: true, anneeAcademique: true } },
      },
    },
    documentCorrige: {
      select: { id: true, reference: true, urlPdf: true, statut: true },
    },
  };
}

function exposeDocumentType(reclamation) {
  if (!reclamation?.document) return reclamation;
  return {
    ...reclamation,
    document: {
      ...reclamation.document,
      typeDocument: reclamation.document.demande?.typeDocument || null,
    },
  };
}

function exposeDocumentTypeList(reclamations) {
  return Array.isArray(reclamations) ? reclamations.map(exposeDocumentType) : [];
}

exports.createReclamation = async ({ user, documentId, type, description, piecesJointes }) => {
  const cleanDocumentId = normalize(documentId);
  const cleanType = normalizeUpper(type);
  const cleanDescription = normalize(description);

  if (!cleanDocumentId || !cleanType || cleanDescription.length < 20) {
    const err = new Error("documentId, type et description de 20 caracteres minimum sont requis.");
    err.statusCode = 400;
    throw err;
  }

  const document = await getDocumentForStudent(cleanDocumentId, user.id);
  if (document.statut !== "DISPONIBLE") {
    const err = new Error("Seuls les documents disponibles peuvent faire l'objet d'une reclamation.");
    err.statusCode = 403;
    throw err;
  }

  const reclamation = await prisma.reclamation.create({
    data: {
      documentId: cleanDocumentId,
      etudiantId: user.id,
      type: cleanType,
      description: cleanDescription,
      piecesJointes: Array.isArray(piecesJointes) ? piecesJointes.slice(0, 3) : [],
    },
    include: includeFull(),
  });

  await emailService.sendReclamationCreee?.(document.demande.utilisateur.email, reclamation.id);
  return exposeDocumentType(reclamation);
};

exports.getReclamations = async ({ filters = {}, user }) => {
  assertAgent(user);
  const where = {};
  const statut = normalizeUpper(filters.statut);
  const type = normalizeUpper(filters.type);
  const search = normalize(filters.search).toLowerCase();

  if (statut) where.statut = statut;
  if (type) where.type = type;
  if (user.role !== "SUPER_ADMIN" && user.institutionId) {
    where.document = { demande: { institutionId: user.institutionId } };
  }
  if (search) {
    where.etudiant = {
      OR: [
        { nom: { contains: search, mode: "insensitive" } },
        { prenom: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    };
  }

  const reclamations = await prisma.reclamation.findMany({
    where,
    include: includeFull(),
    orderBy: { createdAt: "desc" },
  });
  return exposeDocumentTypeList(reclamations);
};

exports.getMesReclamations = async (user) => {
  const reclamations = await prisma.reclamation.findMany({
    where: { etudiantId: user.id },
    include: includeFull(),
    orderBy: { createdAt: "desc" },
  });
  return exposeDocumentTypeList(reclamations);
};

exports.getReclamationById = async (id, user) => {
  const reclamation = await prisma.reclamation.findUnique({
    where: { id },
    include: includeFull(),
  });
  if (!reclamation) {
    const err = new Error("Reclamation introuvable");
    err.statusCode = 404;
    throw err;
  }
  await assertReclamationAccess(reclamation, user);
  return exposeDocumentType(reclamation);
};

exports.prendreEnCharge = async ({ id, agentId, user }) => {
  assertAgent(user);
  const reclamation = await exports.getReclamationById(id, user);
  const targetAgentId = agentId || user.id;

  const updated = await prisma.reclamation.update({
    where: { id: reclamation.id },
    data: { statut: "EN_COURS", traiteParId: targetAgentId },
    include: includeFull(),
  });

  const agentNom = `${user.prenom || ""} ${user.nom || ""}`.trim();
  await emailService.sendReclamationPriseEnCharge?.(updated.etudiant.email, updated.id, agentNom);
  return exposeDocumentType(updated);
};

async function regenerateDocumentFromReclamation(reclamation) {
  const original = await prisma.document.findUnique({
    where: { id: reclamation.documentId },
    include: {
      demande: true,
    },
  });

  const demande = await prisma.demande.findUnique({
    where: { id: original.demandeId },
    include: { utilisateur: true, institution: true },
  });

  const reference = `${original.reference}-CORR-${Date.now().toString(36).toUpperCase()}`;
  const baseUrl = process.env.APP_URL || "http://localhost:5000";
  const qrData = `${baseUrl}/verify/${reference}`;
  const pdfPath =
    demande.typeDocument === "ATTESTATION_INSCRIPTION"
      ? await pdfService.generateAttestationInscription(
          demande,
          demande.utilisateur,
          reference,
          demande.institution,
          qrData
        )
      : await pdfService.generateDocument(
          demande,
          demande.utilisateur,
          null,
          reference,
          demande.institution,
          qrData
        );

  await qrcodeService.generate(qrData, reference);

  return prisma.$transaction(async (tx) => {
    const newDoc = await tx.document.create({
      data: {
        reference,
        qrPayload: qrData,
        urlPdf: pdfPath,
        demandeId: original.demandeId,
        statut: "DISPONIBLE",
        deliveredAt: new Date(),
        generationSource: "RECLAMATION",
      },
    });

    await tx.document.update({
      where: { id: original.id },
      data: { statut: "REMPLACE", remplaceParId: newDoc.id },
    });

    return newDoc;
  });
}

exports.resoudreReclamation = async ({ id, user, action, reponseAgent }) => {
  assertAgent(user);
  const normalizedAction = normalizeUpper(action);
  if (!RESOLUTION_ACTIONS.has(normalizedAction)) {
    const err = new Error("action invalide (REGENERER_DOC ou EXPLIQUER)");
    err.statusCode = 400;
    throw err;
  }

  const reclamation = await exports.getReclamationById(id, user);
  const now = new Date();

  if (normalizedAction === "REGENERER_DOC") {
    const nouveauDocument = await regenerateDocumentFromReclamation(reclamation);
    const updated = await prisma.reclamation.update({
      where: { id: reclamation.id },
      data: {
        statut: "RESOLUE_DOC_REGENERE",
        reponseAgent: normalize(reponseAgent) || "Document corrige regenere.",
        documentCorrigeId: nouveauDocument.id,
        resolvedAt: now,
        traiteParId: reclamation.traiteParId || user.id,
      },
      include: includeFull(),
    });
    await emailService.sendReclamationResolueDocRegenere?.(
      updated.etudiant.email,
      updated.id,
      path.basename(nouveauDocument.urlPdf)
    );
    await emailService.sendDocumentDisponible?.(
      updated.etudiant.email,
      updated.etudiant.prenom,
      updated.document?.demande?.typeDocument || "Document",
      [toMailDocument(nouveauDocument, updated.document?.demande?.typeDocument)]
    );
    return exposeDocumentType(updated);
  }

  const cleanResponse = normalize(reponseAgent);
  if (cleanResponse.length < 10) {
    const err = new Error("reponseAgent est requise pour expliquer sans document.");
    err.statusCode = 400;
    throw err;
  }

  const updated = await prisma.reclamation.update({
    where: { id: reclamation.id },
    data: {
      statut: "RESOLUE_SANS_DOC",
      reponseAgent: cleanResponse,
      resolvedAt: now,
      traiteParId: reclamation.traiteParId || user.id,
    },
    include: includeFull(),
  });
  await emailService.sendReclamationResolueSansDoc?.(updated.etudiant.email, updated.id, cleanResponse);
  return exposeDocumentType(updated);
};

exports.getStats = async (user) => {
  assertAgent(user);
  const byStatus = await prisma.reclamation.groupBy({
    by: ["statut"],
    _count: { _all: true },
  });
  const byType = await prisma.reclamation.groupBy({
    by: ["type"],
    _count: { _all: true },
  });
  return { byStatus, byType };
};
