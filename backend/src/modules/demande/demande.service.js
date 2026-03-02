// src/modules/demande/demande.service.js

const prisma = require("../../config/prisma");
const { assertPermission, getNextStatut } = require("../../utils/workflow");
const emailService = require("../../services/email.service");

const normalizeField = (v) => String(v || "").trim().toUpperCase();

/**
 * Normalise les valeurs possibles de "service"
 * Ex: "EXAMEN" => "EXAMENS"
 */
const normalizeService = (s) => {
  const v = normalizeField(s);
  if (!v) return "";
  if (v === "EXAMEN") return "EXAMENS";
  if (v === "EXAMENS") return "EXAMENS";
  if (v === "SCOLARITE") return "SCOLARITE";
  return v;
};

const getServiceCible = (typeDocument) =>
  normalizeField(typeDocument) === "RELEVE_NOTES" ? "EXAMENS" : "SCOLARITE";

const REQUIRED_PIECES_BY_DOC = {
  RELEVE_NOTES: ["JUSTIFICATIF_INSCRIPTION", "ACTE_NAISSANCE", "CIP", "QUITTANCE"],
  ATTESTATION_INSCRIPTION: ["JUSTIFICATIF_INSCRIPTION", "ACTE_NAISSANCE", "CIP", "QUITTANCE"],
};

const DEFAULT_REQUIRED = ["CIP", "QUITTANCE"];

const parseSemestres = (semestres) => {
  if (!semestres) return [];
  if (Array.isArray(semestres)) return semestres.map((s) => parseInt(s, 10)).filter(Boolean);
  const n = parseInt(semestres, 10);
  return Number.isFinite(n) ? [n] : [];
};

exports.soumettre = async (utilisateurId, institutionId, body, files) => {
  const { typeDocument, semestres } = body;

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

  return prisma.demande.create({
    data: {
      typeDocument: docKey,
      semestres: parseSemestres(semestres),
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
    include: { pieces: true },
  });
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

    // ✅ CORRECTION : si service non configuré → bloque (sécurité)
    // si service configuré → filtre strict sur serviceCible
    // => Le chef EXAMENS ne voit que les RELEVE_NOTES
    // => Le chef SCOLARITE ne voit que les ATTESTATION_INSCRIPTION
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
    where = { institutionId, statut: "DOCUMENT_GENERE" };
  } else if (role === "DIRECTEUR") {
    where = { institutionId, statut: "ATTENTE_SIGNATURE_DIRECTEUR" };
  } else if (role === "SUPER_ADMIN") {
    where = institutionId ? { institutionId } : {};
  } else {
    where = { institutionId };
  }

  return prisma.demande.findMany({
    where,
    include: {
      utilisateur: { select: { nom: true, prenom: true, numeroEtudiant: true, email: true } },
      pieces: true,
      documents: { select: { reference: true, urlPdf: true, downloadCount: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

exports.getById = async (demandeId, user) => {
  const demande = await prisma.demande.findUnique({
    where: { id: demandeId },
    include: {
      utilisateur: { select: { nom: true, prenom: true, email: true, numeroEtudiant: true } },
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

  const prochainStatut = getNextStatut({
    role,
    statutActuel: demande.statut,
    action,
  });

  const updated = await prisma.$transaction(async (tx) => {
    if (action === "GENERER_DOCUMENT") {
      const { v4: uuidv4 } = require("uuid");
      const pdfService = require("../../services/pdf.service");
      const qrcodeService = require("../../services/qrcode.service");

      const institution = await tx.institution.findUnique({
        where: { id: institutionId },
      });

      const etudiant = await tx.utilisateur.findUnique({
        where: { id: demande.utilisateurId },
      });

      const annee = new Date().getFullYear();
      const sigle = institution?.sigle || "UAC";
      const baseUrl = process.env.APP_URL || "http://localhost:5000";

      // ✅ ATTESTATION D'INSCRIPTION → template dédié
      if (demande.typeDocument === "ATTESTATION_INSCRIPTION") {
        const reference = `ETD-${annee}-${sigle}-ATT-${String(demande.id)
          .substring(0, 5)
          .toUpperCase()}-${uuidv4().substring(0, 4).toUpperCase()}`;
        const qrData = `${baseUrl}/verify/${reference}`;

        const pdfPath = await pdfService.generateAttestationInscription(
          demande,
          etudiant,
          reference,
          institution,
          qrData
        );

        await qrcodeService.generate(qrData, reference);

        await tx.document.create({
          data: {
            reference,
            qrPayload: qrData,
            urlPdf: pdfPath,
            demandeId: demande.id,
          },
        });

        // ✅ RELEVÉ DE NOTES → un PDF par semestre
      } else if (demande.typeDocument === "RELEVE_NOTES") {
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

          await tx.document.create({
            data: {
              reference,
              qrPayload: qrData,
              urlPdf: pdfPath,
              demandeId: demande.id,
            },
          });
        }

        // ✅ Autres types → template générique
      } else {
        const reference = `ETD-${annee}-${sigle}-${String(demande.id)
          .substring(0, 5)
          .toUpperCase()}-${uuidv4().substring(0, 4).toUpperCase()}`;
        const qrData = `${baseUrl}/verify/${reference}`;

        const pdfPath = await pdfService.generateDocument(
          demande,
          etudiant,
          null,
          reference,
          institution,
          qrData
        );

        await qrcodeService.generate(qrData, reference);

        await tx.document.create({
          data: {
            reference,
            qrPayload: qrData,
            urlPdf: pdfPath,
            demandeId: demande.id,
          },
        });
      }
    }

    // ✅✅✅ PATCH EXACT OPTION A :
    // deliveredAt doit être fixé exactement quand on passe à DISPONIBLE
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

    const up = await tx.demande.update({
      where: { id: demandeId },
      data: dataUpdate,
    });

    return up;
  });

  try {
    await emailService.sendStatutChange(
      demande.utilisateur.email,
      demande.utilisateur.prenom,
      prochainStatut
    );
  } catch (e) {
    // Email non bloquant
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

  // ✅ CORRECTION : même logique de filtrage que getDemandes
  // Si service configuré → filtre strict sur serviceCible
  // Si service non configuré → stats sur toute l'institution (cas dégradé)
  const baseFilter = {
    institutionId,
    ...(chefService ? { serviceCible: chefService } : {}),
  };

  const [aTraiter, rejetees, documentGenere, attenteDirecteur, disponibles] =
    await Promise.all([
      prisma.demande.count({
        where: { ...baseFilter, statut: "TRANSMISE_SECRETAIRE_GENERAL" },
      }),
      prisma.demande.count({
        where: { ...baseFilter, statut: "REJETEE" },
      }),
      prisma.demande.count({
        where: { ...baseFilter, statut: "DOCUMENT_GENERE" },
      }),
      prisma.demande.count({
        where: { ...baseFilter, statut: "ATTENTE_SIGNATURE_DIRECTEUR" },
      }),
      prisma.demande.count({
        where: { ...baseFilter, statut: "DISPONIBLE" },
      }),
    ]);

  return {
    aTraiter,
    documentGenere,
    attenteDirecteur,
    disponibles,
    rejetees,
  };
};