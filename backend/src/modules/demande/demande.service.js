// src/modules/demande/demande.service.js

const prisma = require("../../config/prisma");
const { assertPermission, getNextStatut } = require("../../modules/workflow/workflow");
const emailService = require("../../services/email.service");
const { ATTESTATION_INSCRIPTION, RELEVE_NOTES } = require("../../constants/typeDocument");
const { EXAMENS, SCOLARITE } = require("../../constants/services");

const normalizeField = (v) => String(v || "").trim().toUpperCase();

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
  [RELEVE_NOTES]: ["JUSTIFICATIF_INSCRIPTION", "ACTE_NAISSANCE", "CIP", "QUITTANCE"],
  [ATTESTATION_INSCRIPTION]: ["JUSTIFICATIF_INSCRIPTION", "ACTE_NAISSANCE", "CIP", "QUITTANCE"],
};

const DEFAULT_REQUIRED = ["CIP", "QUITTANCE"];

const parseSemestres = (semestres) => {
  if (!semestres) return [];
  if (Array.isArray(semestres)) return semestres.map((s) => parseInt(s, 10)).filter(Boolean);
  const n = parseInt(semestres, 10);
  return Number.isFinite(n) ? [n] : [];
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
    const err = new Error(`Pièces manquantes pour ${docKey}: ${missing.join(", ")}`);
    err.statusCode = 400;
    throw err;
  }

  const allFiles = Object.values(filesObj).flat();

  const demande = await prisma.demande.create({
    data: {
      typeDocument: docKey,
      semestres: parseSemestres(semestres),
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
      demande.id, // référence
      docKey
    );
  } catch (e) {
    console.log("[EMAIL SKIPPED]", e.message);
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
      statut: "DOCUMENT_GENERE",
    };
  } else if (role === "DIRECTEUR") {
    // ✅ Directeur : les demandes au stade "ATTENTE_SIGNATURE_DIRECTEUR"
    // (On filtre sur Demande.statut, PAS sur Document.statut)
    where = {
      institutionId,
      statut: "ATTENTE_SIGNATURE_DIRECTEUR",
    };
  } else if (role === "SUPER_ADMIN") {
    where = institutionId ? { institutionId } : {};
  } else {
    where = { institutionId };
  }

  // documents retournés (pas de "statut", car Document.statut n'existe pas)
  const documentsInclude = {
    select: {
      reference: true,
      urlPdf: true,
      downloadCount: true,
      qrPayload: true,
      createdAt: true,
      deliveredAt: true,
      maxDownloads: true,
      blockedAt: true,
    },
  };

  return prisma.demande.findMany({
    where,
    include: {
      utilisateur: { select: { nom: true, prenom: true, numeroEtudiant: true, email: true } },
      pieces: true,
      documents: documentsInclude,
    },
    orderBy: { createdAt: "desc" },
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

  if (demande.typeDocument === ATTESTATION_INSCRIPTION) {
    const reference = `ETD-${annee}-${sigle}-ATT-${String(demande.id).substring(0, 5).toUpperCase()}-${uuidv4()
      .substring(0, 4)
      .toUpperCase()}`;
    const qrData = `${baseUrl}/verify/${reference}`;

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
      const reference = `ETD-${annee}-${sigle}-S${semestre}-${String(demande.id)
        .substring(0, 5)
        .toUpperCase()}-${uuidv4().substring(0, 4).toUpperCase()}`;
      const qrData = `${baseUrl}/verify/${reference}`;

      const pdfPath = await pdfService.generateDocument(
        { ...demande, semestre },
        etudiant,
        null,
        reference,
        institution,
        qrData
      );

      await qrcodeService.generate(qrData, reference);
      results.push({ reference, qrPayload: qrData, urlPdf: pdfPath });
    }

    return results;
  }

  const reference = `ETD-${annee}-${sigle}-${String(demande.id).substring(0, 5).toUpperCase()}-${uuidv4()
    .substring(0, 4)
    .toUpperCase()}`;
  const qrData = `${baseUrl}/verify/${reference}`;

  const pdfPath = await pdfService.generateDocument(demande, etudiant, null, reference, institution, qrData);

  await qrcodeService.generate(qrData, reference);
  results.push({ reference, qrPayload: qrData, urlPdf: pdfPath });
  return results;
}

exports.avancer = async (demandeId, action, actorId, role, institutionId, commentaire) => {
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
      const err = new Error("Toutes les pièces doivent être validées avant génération.");
      err.statusCode = 400;
      throw err;
    }
  }

  const prochainStatut = getNextStatut({ role, statutActuel: demande.statut, action });

  let generatedDocs = null;
  if (action === "GENERER_DOCUMENT") {
    generatedDocs = await generateDocumentsOutsideTransaction({ demande, institutionId });
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (action === "GENERER_DOCUMENT" && Array.isArray(generatedDocs) && generatedDocs.length) {
      const existingCount = await tx.document.count({ where: { demandeId: demande.id } });
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
      await emailService.sendDocumentDisponible(
        demande.utilisateur.email,
        demande.utilisateur.prenom,
        demande.typeDocument
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

  return updated;
};

exports.validerPiece = async (pieceId, statut, commentaire, actorId, role, institutionId, service) => {
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
    const err = new Error("Statut pièce invalide (attendu: VALIDEE ou REJETEE).");
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
    return { aTraiter: 0, documentGenere: 0, attenteDirecteur: 0, disponibles: 0, rejetees: 0 };
  }

  const baseFilter = { institutionId, serviceCible: chefService };

  const [aTraiter, rejetees, documentGenere, attenteDirecteur, disponibles] = await Promise.all([
    prisma.demande.count({ where: { ...baseFilter, statut: "TRANSMISE_SECRETAIRE_GENERAL" } }),
    prisma.demande.count({ where: { ...baseFilter, statut: "REJETEE" } }),
    prisma.demande.count({ where: { ...baseFilter, statut: "DOCUMENT_GENERE" } }),
    prisma.demande.count({ where: { ...baseFilter, statut: "ATTENTE_SIGNATURE_DIRECTEUR" } }),
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
    prisma.demande.count({
      where: { institutionId, statut: "DOCUMENT_GENERE" },
    }),
    prisma.demande.count({
      where: {
        institutionId,
        statut: "ATTENTE_SIGNATURE_DIRECTEUR",
        updatedAt: { gte: startMonth, lt: nextMonth },
      },
    }),
    prisma.demande.count({
      where: {
        institutionId,
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
    prisma.demande.count({ where: { institutionId, statut: "TRANSMISE_SECRETAIRE_GENERAL" } }),
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
    prisma.demande.count({
      where: { institutionId, statut: "ATTENTE_SIGNATURE_DIRECTEUR" },
    }),
    prisma.demande.count({
      where: {
        institutionId,
        statut: "DISPONIBLE",
        updatedAt: { gte: startMonth, lt: nextMonth },
      },
    }),
    prisma.demande.count({
      where: {
        institutionId,
        statut: "REJETEE",
        updatedAt: { gte: startMonth, lt: nextMonth },
      },
    }),
  ]);

  return { aSigner, signesCeMois, refuses };
};