// src/modules/demande/demande.service.js

const prisma = require("../../config/prisma");
const fs = require("fs");
const crypto = require("crypto");
const {
  assertPermission,
  getNextStatut,
} = require("../../modules/workflow/workflow");
const emailService = require("../../services/email.service");
const notifService = require("../notification/notification.service");
const { ATTESTATION_INSCRIPTION, RELEVE_NOTES } = require("../../constants/typeDocument");
const { EXAMENS, SCOLARITE } = require("../../constants/services");
const { toSafeAbsolutePath } = require("../../utils/fileUtils");

const normalizeField = (v) =>
  String(v || "")
    .trim()
    .toUpperCase();

const labelType = (t) => {
  if (t === "RELEVE_NOTES") return "relevé de notes";
  if (t === "ATTESTATION_INSCRIPTION") return "attestation d'inscription";
  return String(t || "document").toLowerCase();
};

const documentLabel = (t) => {
  if (t === "RELEVE_NOTES") return "Releve de notes";
  if (t === "ATTESTATION_INSCRIPTION") return "Attestation d'inscription";
  return "Document";
};

const toMailDocument = (doc, typeDocument) => {
  const absPath = toSafeAbsolutePath(doc.urlPdf);
  return {
    reference: doc.reference,
    filename: `${documentLabel(typeDocument)} - ${doc.reference}.pdf`,
    absPath,
  };
};

const normalizeService = (s) => {
  const v = normalizeField(s);
  if (!v) return "";
  if (v === "EXAMEN") return EXAMENS;
  if (v === EXAMENS) return EXAMENS;
  if (v === SCOLARITE) return SCOLARITE;
  return v;
};

const getServiceCible = (typeDocument) =>
  normalizeField(typeDocument) === RELEVE_NOTES ? EXAMENS : SCOLARITE;

const getProchainRole = (statut) => {
  const roleMap = {
    "TRANSMISE_SECRETAIRE_ADJOINT": "SECRETAIRE_ADJOINT",
    "TRANSMISE_SECRETAIRE_GENERAL": "SECRETAIRE_GENERAL",
    "TRANSMISE_CHEF_DIVISION": "CHEF_DIVISION",
    "ATTENTE_SIGNATURE_DIRECTEUR_ADJOINT": "DIRECTEUR_ADJOINT",
    "ATTENTE_SIGNATURE_DIRECTEUR": "DIRECTEUR"
  };
  return roleMap[statut];
};

const REQUIRED_PIECES_BY_DOC = {
  RELEVE_NOTES: [
    "JUSTIFICATIF_INSCRIPTION",
    "ACTE_NAISSANCE",
    "CIP",
    "QUITTANCE",
  ],
  ATTESTATION_INSCRIPTION: [
    "JUSTIFICATIF_INSCRIPTION",
    "ACTE_NAISSANCE",
    "CIP",
    "QUITTANCE",
  ],
};

const DEFAULT_REQUIRED = ["CIP", "QUITTANCE"];

const parseSemestres = (semestres) => {
  if (!semestres) return [];
  if (Array.isArray(semestres))
    return semestres.map((s) => {
      const match = String(s).match(/\d+/);
      return match ? parseInt(match[0], 10) : null;
    }).filter(Boolean);
  const match = String(semestres).match(/\d+/);
  const n = match ? parseInt(match[0], 10) : null;
  return Number.isFinite(n) ? [n] : [];
};

const levelRank = (niveau) => {
  const raw = String(niveau || "").toUpperCase();
  const match = raw.match(/(?:L|LICENCE)\s*([123])|(?:M|MASTER)\s*([12])|DOCTORAT\s*([123])/);
  if (!match) return 1;
  if (match[1]) return Number(match[1]);
  if (match[2]) return 3 + Number(match[2]);
  if (match[3]) return 5 + Number(match[3]);
  return 1;
};

const assertAcademicScopeAllowed = (etudiant, docKey, parsedSemestres, anneeAcademique) => {
  const rank = levelRank(etudiant?.niveau);
  const maxSemester = Math.min(rank * 2, 6);

  if (docKey === RELEVE_NOTES && parsedSemestres.some((s) => s > maxSemester)) {
    const err = new Error(
      `Votre niveau actuel ne permet pas de demander un releve au-dela du semestre ${maxSemester}.`
    );
    err.statusCode = 400;
    throw err;
  }

  if (docKey === ATTESTATION_INSCRIPTION && anneeAcademique) {
    const allYears = ["2022-2023", "2023-2024", "2024-2025", "2025-2026"];
    const allowedYears = allYears.slice(Math.max(0, allYears.length - Math.min(rank, allYears.length)));
    if (!allowedYears.includes(String(anneeAcademique).trim())) {
      const err = new Error("Votre niveau actuel ne permet pas de demander ce document pour cette annee.");
      err.statusCode = 400;
      throw err;
    }
  }
};

const sameSemestres = (a = [], b = []) => {
  const left = [...a].map(Number).filter(Number.isFinite).sort((x, y) => x - y);
  const right = [...b].map(Number).filter(Number.isFinite).sort((x, y) => x - y);
  return left.length === right.length && left.every((value, index) => value === right[index]);
};

const normalizeAnnee = (anneeAcademique) =>
  anneeAcademique ? String(anneeAcademique).trim() : null;

const hashFile = (filePath) => {
  if (!filePath || !fs.existsSync(filePath)) return null;
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
};

async function assertNoExistingDemande(utilisateurId, docKey, parsedSemestres, anneeAcademique) {
  const existing = await prisma.demande.findMany({
    where: {
      utilisateurId,
      typeDocument: docKey,
      anneeAcademique: normalizeAnnee(anneeAcademique),
    },
    include: {
      documents: {
        select: { reference: true, deliveredAt: true, urlPdf: true },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const match = existing.find((d) => sameSemestres(d.semestres, parsedSemestres));
  if (!match) return;

  const hasDeliveredDoc = match.statut === "DISPONIBLE";
  const references = match.documents.length
    ? match.documents.map((d) => d.reference).join(", ")
    : match.reference;

  const err = new Error(
    hasDeliveredDoc
      ? `Ce document a deja ete genere (${references}). Verifiez votre email; si vous l'avez perdu, demandez le renvoi du mail depuis vos demandes.`
      : `Une demande existe deja pour ce document (${match.reference}). Consultez son statut dans Mes demandes.`
  );
  err.statusCode = 409;
  err.code = hasDeliveredDoc ? "DOCUMENT_ALREADY_DELIVERED" : "DEMANDE_ALREADY_EXISTS";
  err.references = references;
  throw err;
}

async function assertQuittanceNotUsed(filesObj) {
  const quittanceFile = Object.values(filesObj || {})
    .flat()
    .find((file) => normalizeField(file.fieldname) === "QUITTANCE");

  if (!quittanceFile) return null;

  const fingerprint = hashFile(quittanceFile.path);
  if (!fingerprint) return null;

  const existing = await prisma.pieceJustificative.findFirst({
    where: {
      typePiece: "QUITTANCE",
      quittanceFingerprint: fingerprint,
    },
    include: {
      demande: {
        select: {
          reference: true,
          utilisateur: { select: { nom: true, prenom: true } },
        },
      },
    },
  });

  if (existing) {
    const ref = existing.demande?.reference || "une demande existante";
    const err = new Error(`Cette quittance a deja ete utilisee pour ${ref}.`);
    err.statusCode = 409;
    err.code = "QUITTANCE_ALREADY_USED";
    throw err;
  }

  return fingerprint;
}

function generateReference(typeDocument, semestres, anneeAcademique, etudiant) {
  const formatNomPrenom = (nom, prenom) => {
    const n = String(nom || "").trim();
    const p = String(prenom || "").trim();
    // Keep letters (including accented), remove spaces and non-letter chars
    const cleanNom = n
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "")
      .replace(/[^A-Za-z]/g, "");
    const initial = p ? String(p[0]).toUpperCase() : "";
    // Example: Kouliho + P => KoulihoP
    return `${cleanNom}${initial}`;
  };

  const nomPrenom = formatNomPrenom(etudiant.nom, etudiant.prenom);
  const annee = anneeAcademique ? String(anneeAcademique).substring(0, 4) : new Date().getFullYear();

  let prefix = "DOC";
  if (typeDocument === "ATTESTATION_INSCRIPTION") prefix = "ATT-INSC";
  else if (typeDocument === "RELEVE_NOTES") prefix = "REL-NOTES";
  else if (typeDocument === "ATTESTATION_SUCCES") prefix = "ATT-SUCC";
  else if (typeDocument === "ATTESTATION_ADMISSIBILITE") prefix = "ATT-ADMIS";

  let sPart = "";
  if ((typeDocument === "ATTESTATION_INSCRIPTION" || typeDocument === "RELEVE_NOTES") && semestres && semestres.length > 0) {
    // For multiple semesters, join with '-' but keep leading `_S`
    sPart = `_S${semestres.join("-")}`;
  }

  const baseRef = `${prefix}_${nomPrenom}${sPart}_${annee}`;
  return baseRef;
}

function generateDocumentReference(typeDocument, semestre, anneeAcademique, etudiant) {
  const formatNomPrenom = (nom, prenom) => {
    const n = String(nom || "").trim();
    const p = String(prenom || "").trim();
    const cleanNom = n
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "")
      .replace(/[^A-Za-z]/g, "");
    const initial = p ? String(p[0]).toUpperCase() : "";
    return `${cleanNom}${initial}`;
  };

  const nomPrenom = formatNomPrenom(etudiant.nom, etudiant.prenom);
  const annee = anneeAcademique
    ? String(anneeAcademique).substring(0, 4)
    : new Date().getFullYear();
  const prefix = typeDocument === "RELEVE_NOTES" ? "REL-NOTES" : "DOC";
  const baseRef = `${prefix}_${nomPrenom}_S${semestre}_${annee}`;
  return baseRef;
}

// Notifie tous les super admins (activité globale du workflow)
const notifierAdmins = async ({ type, titre, message, demandeId }) => {
  const admins = await prisma.utilisateur.findMany({
    where: { role: "SUPER_ADMIN", actif: true },
    select: { id: true },
  });
  if (admins.length) {
    await notifService.createMany(
      admins.map((a) => ({ utilisateurId: a.id, type, titre, message, demandeId }))
    );
  }
};

exports.soumettre = async (utilisateurId, institutionId, body, files) => {
  const { typeDocument, semestres, anneeAcademique } = body;

  if (!typeDocument) {
    const err = new Error("typeDocument est requis");
    err.statusCode = 400;
    throw err;
  }

  const docKey = normalizeField(typeDocument);
  const filesObj = files || {};
  const present = new Set(Object.keys(filesObj).map(normalizeField));
  const required = REQUIRED_PIECES_BY_DOC[docKey] || DEFAULT_REQUIRED;
  const missing = required.filter((p) => !present.has(p));

  if (missing.length) {
    const err = new Error(
      `Pièces manquantes pour ${docKey}: ${missing.join(", ")}`
    );
    err.statusCode = 400;
    throw err;
  }

  const allFiles = Object.values(filesObj).flat();

  const etudiant = await prisma.utilisateur.findUnique({ where: { id: utilisateurId } });
  const parsedSemestres = parseSemestres(semestres);
  assertAcademicScopeAllowed(etudiant, docKey, parsedSemestres, anneeAcademique);
  await assertNoExistingDemande(utilisateurId, docKey, parsedSemestres, anneeAcademique);
  const quittanceFingerprint = await assertQuittanceNotUsed(filesObj);
  const reference = generateReference(docKey, parsedSemestres, anneeAcademique, etudiant);

  const [referenceTaken, documentReferenceTaken] = await Promise.all([
    prisma.demande.findUnique({ where: { reference } }),
    prisma.document.findUnique({ where: { reference } }),
  ]);
  if (referenceTaken || documentReferenceTaken) {
    const err = new Error(
      "Une reference identique existe deja. Verifiez les informations de l'etudiant avant de soumettre."
    );
    err.statusCode = 409;
    err.code = "REFERENCE_ALREADY_EXISTS";
    throw err;
  }

  const demande = await prisma.demande.create({
    data: {
      reference,
      typeDocument: docKey,
      semestres: parsedSemestres,
      anneeAcademique: anneeAcademique ? String(anneeAcademique).trim() : null,
      serviceCible: normalizeService(getServiceCible(docKey)),
      statut: "SOUMISE",
      utilisateurId,
      institutionId,
      pieces: {
        create: allFiles.map((f) => ({
          typePiece: normalizeField(f.fieldname),
          nom: f.originalname,
          url: f.path,
          quittanceFingerprint:
            normalizeField(f.fieldname) === "QUITTANCE" ? quittanceFingerprint : null,
          ocrStatut:
            normalizeField(f.fieldname) === "QUITTANCE"
              ? (quittanceFingerprint ? "FINGERPRINT_OK" : "NON_ANALYSEE")
              : null,
          statut: "SOUMISE",
        })),
      },
      historique: {
        create: {
          statut: "SOUMISE",
          commentaire: "Demande soumise par l'étudiant",
          actorId: utilisateurId,
        },
      },
    },
    include: {
      utilisateur: { select: { email: true, prenom: true } }
    },
  });

  // Envoyer emails après création
  try {
    // Récupérer le Secrétaire Adjoint
    const secretaireAdjoint = await prisma.utilisateur.findFirst({
      where: { role: "SECRETAIRE_ADJOINT", institutionId },
      select: { email: true, prenom: true, role: true }
    });

    // Compter les demandes SOUMISES avant ajout
    const countSoumises = await prisma.demande.count({
      where: { institutionId, statut: "SOUMISE" }
    });

    // Si la file était vide (countSoumises était 0 avant cette demande), notifier le SA
    if (countSoumises === 1 && secretaireAdjoint) {
      await emailService.sendAgentNotification(
        secretaireAdjoint.email,
        secretaireAdjoint.prenom,
        secretaireAdjoint.role,
        1
      );
    }

    // Confirmer à l'étudiant
    await emailService.sendDemandeConfirmee(
      demande.utilisateur.email,
      demande.utilisateur.prenom,
      demande.reference, // référence attribuée à la demande
      docKey
    );
  } catch (e) {
    console.log("[EMAIL SKIPPED]", e.message);
  }

  // Notifications in-app
  try {
    // Notifier l'étudiant
    await notifService.createNotification({
      utilisateurId,
      type: "DEMANDE_SOUMISE",
      titre: "Demande soumise",
      message: `Votre demande de ${labelType(docKey)} (réf. ${demande.reference}) a bien été reçue et est en cours de traitement.`,
      demandeId: demande.id,
    });

    // Notifier tous les SA de l'institution
    const agentsSA = await prisma.utilisateur.findMany({
      where: { role: "SECRETAIRE_ADJOINT", institutionId, actif: true },
      select: { id: true },
    });
    if (agentsSA.length) {
      await notifService.createMany(
        agentsSA.map((a) => ({
          utilisateurId: a.id,
          type: "NOUVELLE_DEMANDE",
          titre: "Nouvelle demande à traiter",
          message: `Une nouvelle demande de ${labelType(docKey)} a été soumise.`,
          demandeId: demande.id,
        }))
      );
    }

    // Notifier les super admins (activité globale)
    await notifierAdmins({
      type: "ACTIVITE",
      titre: "Nouvelle demande",
      message: `Nouvelle demande de ${labelType(docKey)} soumise (réf. ${demande.reference}).`,
      demandeId: demande.id,
    });
  } catch (e) {
    console.log("[NOTIF SKIPPED]", e.message);
  }

  return demande;
};

exports.getDemandes = async (user) => {
  const { id, role, institutionId, service } = user;

  let where = {};

  if (role === "ETUDIANT") {
    where = { utilisateurId: id };
  } else if (role === "SECRETAIRE_ADJOINT") {
    where = { institutionId, statut: "SOUMISE" };
  } else if (role === "SECRETAIRE_GENERAL") {
    where = { institutionId, statut: "TRANSMISE_SECRETAIRE_ADJOINT" };
  } else if (role === "CHEF_DIVISION") {
    const chefService = normalizeService(service);
    if (!chefService) {
      where = { id: "__NOPE__" };
    } else {
      where = {
        institutionId,
        statut: "TRANSMISE_SECRETAIRE_GENERAL",
        serviceCible: chefService,
      };
    }
  } else if (role === "DIRECTEUR_ADJOINT") {
    // ✅ DA : les demandes au stade "DOCUMENT_GENERE"
    // (On filtre sur Demande.statut, PAS sur Document.statut)
    where = {
      institutionId,
      documents: { some: { statut: "DOCUMENT_GENERE" } },
    };
  } else if (role === "DIRECTEUR") {
    // ✅ Directeur : les demandes au stade "ATTENTE_SIGNATURE_DIRECTEUR"
    // (On filtre sur Demande.statut, PAS sur Document.statut)
    where = {
      institutionId,
      documents: { some: { statut: "ATTENTE_SIGNATURE_DIRECTEUR" } },
    };
  } else if (role === "SUPER_ADMIN") {
    where = institutionId ? { institutionId } : {};
  } else {
    where = { institutionId };
  }

  // documents retournés (pas de "statut", car Document.statut n'existe pas)
  const documentWhere =
    role === "DIRECTEUR_ADJOINT"
      ? { statut: "DOCUMENT_GENERE" }
      : role === "DIRECTEUR"
        ? { statut: "ATTENTE_SIGNATURE_DIRECTEUR" }
        : undefined;

  const documentsInclude = {
    ...(documentWhere ? { where: documentWhere } : {}),
    select: {
      id: true,
      reference: true,
      statut: true,
      createdAt: true,
      deliveredAt: true,
    },
  };

  const demandes = await prisma.demande.findMany({
    where,
    include: {
      utilisateur: {
        select: { nom: true, prenom: true, numeroEtudiant: true, email: true },
      },
      pieces: true,
      documents: documentsInclude,
      historique: {
        where: { statut: "REJETEE" },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { commentaire: true, createdAt: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Exposer le commentaire de rejet directement sur l'objet demande
  return demandes.map((d) => {
    const motifRejet = d.historique?.[0]?.commentaire || null;
    const { historique, ...rest } = d;
    return { ...rest, motifRejet };
  });
};

exports.getById = async (demandeId, user) => {
  const demande = await prisma.demande.findUnique({
    where: { id: demandeId },
    include: {
      utilisateur: {
        select: {
          nom: true,
          prenom: true,
          email: true,
          numeroEtudiant: true,
          filiere: true,
          niveau: true,
        },
      },
      pieces: true,
      documents: true,
      historique: {
        include: { actor: { select: { nom: true, prenom: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!demande) {
    const err = new Error("Demande introuvable");
    err.statusCode = 404;
    throw err;
  }

  if (user.role === "ETUDIANT" && demande.utilisateurId !== user.id) {
    const err = new Error("Accès refusé");
    err.statusCode = 403;
    throw err;
  }

  if (user.role !== "ETUDIANT" && user.role !== "SUPER_ADMIN") {
    if (demande.institutionId !== user.institutionId) {
      const err = new Error("Accès refusé");
      err.statusCode = 403;
      throw err;
    }
  }

  return demande;
};

async function generateDocumentsOutsideTransaction({ demande, institutionId }) {
  const { v4: uuidv4 } = require("uuid");
  const pdfService = require("../../services/pdf.service");
  const qrcodeService = require("../../services/qrcode.service");

  const [institution, etudiant] = await Promise.all([
    prisma.institution.findUnique({ where: { id: institutionId } }),
    prisma.utilisateur.findUnique({ where: { id: demande.utilisateurId } }),
  ]);

  if (!institution) {
    const err = new Error("Institution introuvable pour la génération.");
    err.statusCode = 400;
    throw err;
  }

  if (!etudiant) {
    const err = new Error("Étudiant introuvable pour la génération.");
    err.statusCode = 400;
    throw err;
  }

  const annee = new Date().getFullYear();
  const sigle = institution?.sigle || "UAC";
  const baseUrl = process.env.APP_URL || "http://localhost:5000";

  const results = [];
  const reference = demande.reference;
  const qrData = `${baseUrl}/verify/${reference}`;

  if (demande.typeDocument === "ATTESTATION_INSCRIPTION") {
    const pdfPath = await pdfService.generateAttestationInscription(
      demande,
      etudiant,
      reference,
      institution,
      qrData
    );

    await qrcodeService.generate(qrData, reference);
    results.push({ reference, qrPayload: qrData, urlPdf: pdfPath });
    return results;
  }

  if (demande.typeDocument === "RELEVE_NOTES") {
    const semestres = demande.semestres?.length ? demande.semestres : [1];

    for (const semestre of semestres) {
      const docReference = generateDocumentReference(
        demande.typeDocument,
        semestre,
        demande.anneeAcademique,
        etudiant
      );
      const existingDoc = await prisma.document.findUnique({
        where: { reference: docReference },
        select: { id: true },
      });
      if (existingDoc) {
        const err = new Error(`Document deja genere pour la reference ${docReference}.`);
        err.statusCode = 409;
        throw err;
      }
      const docQrData = `${baseUrl}/verify/${docReference}`;
      const demandeSemestre = { ...demande, semestre, semestres: [semestre] };

      const pdfPath = await pdfService.generateDocument(
        demandeSemestre,
        etudiant,
        null,
        docReference,
        institution,
        docQrData
      );

      await qrcodeService.generate(docQrData, docReference);
      results.push({ reference: docReference, qrPayload: docQrData, urlPdf: pdfPath });
    }
    return results;
  }

  const pdfPath = await pdfService.generateDocument(
    demande,
    etudiant,
    null,
    reference,
    institution,
    qrData
  );

  await qrcodeService.generate(qrData, reference);
  results.push({ reference, qrPayload: qrData, urlPdf: pdfPath });
  return results;
}

exports.avancer = async (
  demandeId,
  action,
  actorId,
  role,
  institutionId,
  commentaire
) => {
  const demande = await prisma.demande.findUnique({
    where: { id: demandeId },
    include: { utilisateur: true, pieces: true },
  });

  if (!demande) {
    const err = new Error("Demande introuvable");
    err.statusCode = 404;
    throw err;
  }

  if (role !== "SUPER_ADMIN" && demande.institutionId !== institutionId) {
    const err = new Error("Accès refusé");
    err.statusCode = 403;
    throw err;
  }

  if (role === "ETUDIANT" && demande.utilisateurId !== actorId) {
    const err = new Error("Accès refusé");
    err.statusCode = 403;
    throw err;
  }

  try {
    assertPermission({ role, statutActuel: demande.statut, action });
  } catch (e) {
    const err = new Error(e.message || "Action non permise");
    err.statusCode = 403;
    throw err;
  }

  if (action === "GENERER_DOCUMENT") {
    const invalid = demande.pieces.some((p) => p.statut !== "VALIDEE");
    if (invalid) {
      const err = new Error(
        "Toutes les pièces doivent être validées avant génération."
      );
      err.statusCode = 400;
      throw err;
    }
  }

  const prochainStatut = getNextStatut({
    role,
    statutActuel: demande.statut,
    action,
  });

  let generatedDocs = null;
  if (action === "GENERER_DOCUMENT") {
    generatedDocs = await generateDocumentsOutsideTransaction({
      demande,
      institutionId,
    });
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (
      action === "GENERER_DOCUMENT" &&
      Array.isArray(generatedDocs) &&
      generatedDocs.length
    ) {
      const existingCount = await tx.document.count({
        where: { demandeId: demande.id },
      });
      if (existingCount > 0) {
        const err = new Error("Documents déjà générés pour cette demande.");
        err.statusCode = 400;
        throw err;
      }

      for (const d of generatedDocs) {
        await tx.document.create({
          data: {
            reference: d.reference,
            qrPayload: d.qrPayload,
            urlPdf: d.urlPdf,
            demandeId: demande.id,
          },
        });
      }
    }

    const dataUpdate = {
      statut: prochainStatut,
      historique: {
        create: {
          statut: prochainStatut,
          commentaire: commentaire || action,
          actorId,
        },
      },
    };

    if (prochainStatut === "DISPONIBLE") {
      dataUpdate.deliveredAt = new Date();
    }

    return tx.demande.update({
      where: { id: demandeId },
      data: dataUpdate,
    });
  });

  // Envoyer emails selon le nouveau statut
  try {
    if (prochainStatut === "REJETEE") {
      await emailService.sendDemandeRejetee(
        demande.utilisateur.email,
        demande.utilisateur.prenom,
        demande.typeDocument,
        commentaire || "Demande rejetée"
      );
    } else if (prochainStatut === "DISPONIBLE") {
      const documents = await prisma.document.findMany({
        where: { demandeId: demande.id },
        select: { reference: true, urlPdf: true },
        orderBy: { createdAt: "asc" },
      });
      await emailService.sendDocumentDisponible(
        demande.utilisateur.email,
        demande.utilisateur.prenom,
        demande.typeDocument,
        documents.map((doc) => toMailDocument(doc, demande.typeDocument))
      );
    } else {
      // Pour les autres statuts, notifier l'agent suivant
      const prochainRole = getProchainRole(prochainStatut);
      if (prochainRole) {
        const agent = await prisma.utilisateur.findFirst({
          where: { role: prochainRole, institutionId },
          select: { email: true, prenom: true, role: true }
        });

        if (agent) {
          // Compter les demandes au statut actuel pour cet agent
          const count = await prisma.demande.count({
            where: { institutionId, statut: prochainStatut }
          });

          if (count === 1) { // Seulement si la file n'était pas vide
            await emailService.sendAgentNotification(
              agent.email,
              agent.prenom,
              agent.role,
              count
            );
          }
        }
      }
    }
  } catch (e) {
    console.log("[EMAIL SKIPPED]", e.message);
  }

  // Notifications in-app selon le nouveau statut
  try {
    const docLabel = labelType(demande.typeDocument);

    if (prochainStatut === "REJETEE") {
      const motif = commentaire ? ` Motif : ${commentaire}` : "";
      await notifService.createNotification({
        utilisateurId: demande.utilisateurId,
        type: "REJETEE",
        titre: "Demande rejetée",
        message: `Votre demande de ${docLabel} a été rejetée.${motif}`,
        demandeId: demande.id,
      });
    } else if (prochainStatut === "DISPONIBLE") {
      await notifService.createNotification({
        utilisateurId: demande.utilisateurId,
        type: "DISPONIBLE",
        titre: "Document disponible",
        message: `Votre ${docLabel} est pret et a ete envoye par email.`,
        demandeId: demande.id,
      });
    } else if (prochainStatut === "CORRECTION_DEMANDEE") {
      const motif = commentaire ? ` Motif : ${commentaire}` : "";
      await notifService.createNotification({
        utilisateurId: demande.utilisateurId,
        type: "CORRECTION",
        titre: "Correction demandée",
        message: `Une correction est demandée pour votre demande de ${docLabel}.${motif}`,
        demandeId: demande.id,
      });
    } else {
      // Notifier les agents du niveau suivant
      const agentRoleMap = {
        TRANSMISE_SECRETAIRE_ADJOINT: { role: "SECRETAIRE_GENERAL", titre: "Demande transmise", message: `Une demande de ${docLabel} a été transmise et est en attente de votre traitement.` },
        TRANSMISE_SECRETAIRE_GENERAL: { role: "CHEF_DIVISION", titre: "Demande à traiter", message: `Une demande de ${docLabel} vous a été transmise pour validation des pièces.`, matchService: true },
        DOCUMENT_GENERE: { role: "DIRECTEUR_ADJOINT", titre: "Document à approuver", message: `Un document de ${docLabel} est prêt pour votre approbation.` },
        ATTENTE_SIGNATURE_DIRECTEUR: { role: "DIRECTEUR", titre: "Document à signer", message: `Un document de ${docLabel} est en attente de votre signature.` },
      };

      const target = agentRoleMap[prochainStatut];
      if (target) {
        const whereClause = { role: target.role, institutionId, actif: true };
        if (target.matchService && demande.serviceCible) {
          whereClause.service = demande.serviceCible;
        }
        const agents = await prisma.utilisateur.findMany({
          where: whereClause,
          select: { id: true },
        });
        if (agents.length) {
          await notifService.createMany(
            agents.map((a) => ({
              utilisateurId: a.id,
              type: "NOUVELLE_DEMANDE",
              titre: target.titre,
              message: target.message,
              demandeId: demande.id,
            }))
          );
        }
      }
    }

    // Notifier les super admins à chaque transition (activité globale)
    await notifierAdmins({
      type: "ACTIVITE",
      titre: "Mise à jour d'une demande",
      message: `Demande de ${docLabel} (réf. ${demande.reference}) → ${prochainStatut}.`,
      demandeId: demande.id,
    });
  } catch (e) {
    console.log("[NOTIF SKIPPED]", e.message);
  }

  return updated;
};

exports.validerPiece = async (
  pieceId,
  statut,
  commentaire,
  actorId,
  role,
  institutionId,
  service
) => {
  if (role !== "CHEF_DIVISION") {
    const err = new Error("Seul le Chef de Division peut valider une pièce.");
    err.statusCode = 403;
    throw err;
  }

  const piece = await prisma.pieceJustificative.findUnique({
    where: { id: pieceId },
    include: { demande: true },
  });

  if (!piece) {
    const err = new Error("Pièce introuvable.");
    err.statusCode = 404;
    throw err;
  }

  if (piece.demande.institutionId !== institutionId) {
    const err = new Error("Accès refusé.");
    err.statusCode = 403;
    throw err;
  }

  if (piece.demande.statut !== "TRANSMISE_SECRETAIRE_GENERAL") {
    const err = new Error("La demande n'est pas au stade Chef de Division.");
    err.statusCode = 400;
    throw err;
  }

  const cible = normalizeService(piece.demande.serviceCible);
  const acteur = normalizeService(service);

  if (acteur && cible && cible !== acteur) {
    const err = new Error("Vous ne pouvez pas traiter cette demande.");
    err.statusCode = 403;
    throw err;
  }

  const st = normalizeField(statut);
  const allowed = new Set(["VALIDEE", "REJETEE"]);
  if (!allowed.has(st)) {
    const err = new Error(
      "Statut pièce invalide (attendu: VALIDEE ou REJETEE)."
    );
    err.statusCode = 400;
    throw err;
  }

  return prisma.pieceJustificative.update({
    where: { id: pieceId },
    data: {
      statut: st,
      commentaire,
      valideeParId: actorId,
      valideeAt: new Date(),
    },
  });
};

exports.getStatsChefDivision = async (user) => {
  const { institutionId, service } = user;
  const chefService = normalizeService(service);

  if (!chefService) {
    return {
      aTraiter: 0,
      documentGenere: 0,
      attenteDirecteur: 0,
      disponibles: 0,
      rejetees: 0,
    };
  }

  const baseFilter = { institutionId, serviceCible: chefService };

  const [aTraiter, rejetees, documentGenere, attenteDirecteur, disponibles] =
    await Promise.all([
      prisma.demande.count({
        where: { ...baseFilter, statut: "TRANSMISE_SECRETAIRE_GENERAL" },
      }),
      prisma.demande.count({ where: { ...baseFilter, statut: "REJETEE" } }),
      prisma.demande.count({
        where: { ...baseFilter, statut: "DOCUMENT_GENERE" },
      }),
      prisma.demande.count({
        where: { ...baseFilter, statut: "ATTENTE_SIGNATURE_DIRECTEUR" },
      }),
      prisma.demande.count({ where: { ...baseFilter, statut: "DISPONIBLE" } }),
    ]);

  return { aTraiter, documentGenere, attenteDirecteur, disponibles, rejetees };
};

// ✅ Stats Directeur Adjoint
exports.getStatsDA = async (user) => {
  const { institutionId } = user;

  const now = new Date();
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [aSigner, signesCeMois, refuses] = await Promise.all([
    prisma.document.count({
      where: { demande: { institutionId }, statut: "DOCUMENT_GENERE" },
    }),
    prisma.document.count({
      where: {
        demande: { institutionId },
        statut: "ATTENTE_SIGNATURE_DIRECTEUR",
        updatedAt: { gte: startMonth, lt: nextMonth },
      },
    }),
    prisma.document.count({
      where: {
        demande: { institutionId },
        statut: "REJETEE",
        updatedAt: { gte: startMonth, lt: nextMonth },
      },
    }),
  ]);

  return { aSigner, signesCeMois, refuses };
};

exports.getStatsSG = async (user) => {
  const { institutionId } = user;

  const [transmises, rejetees] = await Promise.all([
    prisma.demande.count({
      where: { institutionId, statut: "TRANSMISE_SECRETAIRE_GENERAL" },
    }),
    prisma.demande.count({ where: { institutionId, statut: "REJETEE" } }),
  ]);

  return { transmises, rejetees };
};

exports.getStatsDI = async (user) => {
  const { institutionId } = user;
  const now = new Date();
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [aSigner, signesCeMois, refuses] = await Promise.all([
    prisma.document.count({
      where: { demande: { institutionId }, statut: "ATTENTE_SIGNATURE_DIRECTEUR" },
    }),
    prisma.document.count({
      where: {
        demande: { institutionId },
        statut: "DISPONIBLE",
        updatedAt: { gte: startMonth, lt: nextMonth },
      },
    }),
    prisma.document.count({
      where: {
        demande: { institutionId },
        statut: "REJETEE",
        updatedAt: { gte: startMonth, lt: nextMonth },
      },
    }),
  ]);

  return { aSigner, signesCeMois, refuses };
};
