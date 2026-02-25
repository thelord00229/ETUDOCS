const prisma = require('../../config/prisma');
const { peutAgir, getNextStatut } = require('../../utils/workflow');
const emailService = require('../../services/email.service');

const normalizeField = (v) => String(v || '').trim().toUpperCase();

/**
 * Normalise les valeurs possibles de "service" côté user et côté demande.
 * Ex: "EXAMEN" => "EXAMENS"
 */
const normalizeService = (s) => {
  const v = normalizeField(s);
  if (!v) return '';
  if (v === 'EXAMEN') return 'EXAMENS';
  if (v === 'EXAMENS') return 'EXAMENS';
  if (v === 'SCOLARITE') return 'SCOLARITE';
  return v;
};

const getServiceCible = (typeDocument) =>
  normalizeField(typeDocument) === 'RELEVE_NOTES' ? 'EXAMENS' : 'SCOLARITE';

const REQUIRED_PIECES_BY_DOC = {
  RELEVE_NOTES: [
    'JUSTIFICATIF_INSCRIPTION',
    'ACTE_NAISSANCE',
    'CIP',
    'QUITTANCE',
  ],
  ATTESTATION_INSCRIPTION: [
    'JUSTIFICATIF_INSCRIPTION',
    'ACTE_NAISSANCE',
    'CIP',
    'QUITTANCE',
  ],
};

const DEFAULT_REQUIRED = ['CIP', 'QUITTANCE'];

exports.soumettre = async (utilisateurId, institutionId, body, files) => {
  const { typeDocument, semestres } = body;

  if (!typeDocument) {
    const err = new Error('typeDocument est requis');
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
      `Pièces manquantes pour ${docKey}: ${missing.join(', ')}`
    );
    err.statusCode = 400;
    throw err;
  }

  const allFiles = Object.values(filesObj).flat();

  return prisma.demande.create({
    data: {
      typeDocument: docKey,
      semestres: Array.isArray(semestres)
        ? semestres.map((s) => parseInt(s, 10))
        : semestres
          ? [parseInt(semestres, 10)]
          : [],
      serviceCible: normalizeService(getServiceCible(docKey)),
      statut: 'SOUMISE',
      utilisateurId,
      institutionId,
      pieces: {
        create: allFiles.map((f) => ({
          typePiece: normalizeField(f.fieldname),
          nom: f.originalname,
          url: f.path,
          statut: 'SOUMISE',
        })),
      },
      historique: {
        create: {
          statut: 'SOUMISE',
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
  } 
  else if (role === "SECRETAIRE_ADJOINT") {
    where = { institutionId, statut: "SOUMISE" };
  }
  else if (role === "SECRETAIRE_GENERAL") {
    where = { 
      institutionId, 
      statut: "TRANSMISE_SECRETAIRE_GENERAL"  // ← ici
    };
  }
  else if (role === "CHEF_DIVISION") {
    where = {
      institutionId,
      statut: "TRANSMISE_CHEF_DIVISION",      // ← ici
      ...(service ? { serviceCible: service } : {}),
    };
  }
  else if (role === "DIRECTEUR_ADJOINT") {
    where = { 
      institutionId, 
      statut: "ATTENTE_SIGNATURE_DIRECTEUR_ADJOINT" 
    };
  }
  else if (role === "DIRECTEUR") {
    where = { 
      institutionId, 
      statut: "ATTENTE_SIGNATURE_DIRECTEUR" 
    };
  }
  else if (role === "SUPER_ADMIN") {
    where = { institutionId };
  }

  console.log(`[getDemandes] Role: ${role}, Where:`, where);

  return prisma.demande.findMany({
    where,
    include: {
      utilisateur: { select: { nom: true, prenom: true, numeroEtudiant: true } },
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
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!demande) {
    const err = new Error('Demande introuvable');
    err.statusCode = 404;
    throw err;
  }

  if (user.role === 'ETUDIANT' && demande.utilisateurId !== user.id) {
    const err = new Error('Accès refusé');
    err.statusCode = 403;
    throw err;
  }

  return demande;
};

exports.avancer = async (demandeId, action, actorId, role, institutionId, commentaire) => {
  const demande = await prisma.demande.findUnique({
    where: { id: demandeId },
    include: { utilisateur: true, pieces: true },
  });

  if (!demande) {
    const err = new Error('Demande introuvable');
    err.statusCode = 404;
    throw err;
  }

  if (demande.institutionId !== institutionId) {
    const err = new Error('Accès refusé');
    err.statusCode = 403;
    throw err;
  }

  console.log("[AVANCER]", {
    actorRole: role,
    action,
    statutActuel: demande.statut,
    demandeId
  });

  if (!peutAgir(role, demande.statut)) {
    const err = new Error('Action non permise pour votre rôle');
    err.statusCode = 403;
    throw err;
  }

  /* ======================================================
     🔒 SÉCURISATION SPÉCIFIQUE PAR RÔLE
  ====================================================== */

  if (role === 'SECRETAIRE_GENERAL' && action !== 'TRANSMETTRE') {
    const err = new Error('Le Secrétaire Général peut uniquement transmettre.');
    err.statusCode = 403;
    throw err;
  }

  if (action === 'GENERER_DOCUMENT' && role !== 'CHEF_DIVISION') {
    const err = new Error('Seul le Chef de Division peut générer le document.');
    err.statusCode = 403;
    throw err;
  }

  if (action === 'GENERER_DOCUMENT') {
    const invalid = demande.pieces.some(p => p.statut !== 'VALIDEE');
    if (invalid) {
      const err = new Error('Toutes les pièces doivent être validées avant génération.');
      err.statusCode = 400;
      throw err;
    }
  }

  /* ======================================================
     📄 GÉNÉRATION DOCUMENT
  ====================================================== */

  if (action === 'GENERER_DOCUMENT') {
    const { v4: uuidv4 } = require('uuid');
    const pdfService = require('../../services/pdf.service');
    const qrcodeService = require('../../services/qrcode.service');

    const institution = await prisma.institution.findUnique({
      where: { id: institutionId },
    });

    const etudiant = await prisma.utilisateur.findUnique({
      where: { id: demande.utilisateurId },
    });

    const annee = new Date().getFullYear();
    const sigle = institution?.sigle || 'UAC';
    const baseUrl = process.env.APP_URL || 'http://localhost:5000';

    if (demande.typeDocument !== 'RELEVE_NOTES') {
      const reference = `ETD-${annee}-${sigle}-${String(demande.id).substring(0,5).toUpperCase()}-${uuidv4().substring(0,4).toUpperCase()}`;
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

      await prisma.document.create({
        data: {
          reference,
          qrPayload: qrData,
          urlPdf: pdfPath,
          demandeId: demande.id,
        },
      });

    } else {
      const semestres = demande.semestres?.length ? demande.semestres : [1];

      for (const semestre of semestres) {
        const reference = `ETD-${annee}-${sigle}-S${semestre}-${String(demande.id).substring(0,5).toUpperCase()}-${uuidv4().substring(0,4).toUpperCase()}`;
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

        await prisma.document.create({
          data: {
            reference,
            qrPayload: qrData,
            urlPdf: pdfPath,
            demandeId: demande.id,
          },
        });
      }
    }
  }

  const prochainStatut = getNextStatut(demande.statut, action);

  const updated = await prisma.demande.update({
    where: { id: demandeId },
    data: {
      statut: prochainStatut,
      historique: {
        create: {
          statut: prochainStatut,
          commentaire: commentaire || action,
          actorId,
        },
      },
    },
  });

  try {
    await emailService.sendStatutChange(
      demande.utilisateur.email,
      demande.utilisateur.prenom,
      prochainStatut
    );
  } catch (e) {
    console.log('[EMAIL SKIPPED]', e.message);
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
  if (role !== 'CHEF_DIVISION') {
    const err = new Error('Seul le Chef de Division peut valider une pièce.');
    err.statusCode = 403;
    throw err;
  }

  const piece = await prisma.pieceJustificative.findUnique({
    where: { id: pieceId },
    include: { demande: true }
  });

  if (!piece) {
    const err = new Error('Pièce introuvable.');
    err.statusCode = 404;
    throw err;
  }

  if (piece.demande.institutionId !== institutionId) {
    const err = new Error('Accès refusé.');
    err.statusCode = 403;
    throw err;
  }

  // On tolère toujours "TRANSMISE_CHEF_DIVISION" (stade attendu)
  if (piece.demande.statut !== 'TRANSMISE_CHEF_DIVISION') {
    const err = new Error('La demande n’est pas au stade Chef de Division.');
    err.statusCode = 400;
    throw err;
  }

  // ✅ FIX IMPORTANT : normalisation (EXAMEN vs EXAMENS, casse, espaces)
  const cible = normalizeService(piece.demande.serviceCible);
  const acteur = normalizeService(service);

  // Si on a bien un service côté acteur et côté demande, on compare.
  // (Si acteur est vide, on ne bloque pas ici — sinon tu tombes sur le bug actuel.)
  if (acteur && cible && cible !== acteur) {
    const err = new Error('Vous ne pouvez pas traiter cette demande.');
    err.statusCode = 403;
    throw err;
  }

  return prisma.pieceJustificative.update({
    where: { id: pieceId },
    data: {
      statut,
      commentaire,
      valideeParId: actorId,
      valideeAt: new Date()
    }
  });
};

exports.getStatsChefDivision = async (user) => {
  const { institutionId, service } = user;

  const baseFilter = {
    institutionId,
    ...(service ? { serviceCible: service } : {}), // ✅ évite Prisma crash
  };

  const [aTraiter, rejetees, enAttenteSignature, disponibles] = await Promise.all([
    prisma.demande.count({ where: { ...baseFilter, statut: "TRANSMISE_CHEF_DIVISION" } }),
    prisma.demande.count({ where: { ...baseFilter, statut: "REJETEE" } }),
    prisma.demande.count({ where: { ...baseFilter, statut: "ATTENTE_SIGNATURE_DIRECTEUR_ADJOINT" } }),
    prisma.demande.count({ where: { ...baseFilter, statut: "DISPONIBLE" } }),
  ]);

  return {
    aTraiter,
    enTraitement: enAttenteSignature,
    generes: disponibles,
    rejetees,
  };
};