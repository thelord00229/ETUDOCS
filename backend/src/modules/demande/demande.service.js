const prisma = require('../../config/prisma');
const { peutAgir, getNextStatut } = require('../../utils/workflow');
const emailService = require('../../services/email.service');

const getServiceCible = (typeDocument) =>
  typeDocument === 'RELEVE_NOTES' ? 'EXAMENS' : 'SCOLARITE';

// 🔥 règles pièces requises selon le document
// NB: Tu m’as dit que RN et Attestation d’inscription ont EXACTEMENT les mêmes pièces.
// Si plus tard tu veux différencier, on change juste ici.
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

// fallback : pour les autres types (si un jour tu les actives)
// pour l’instant on garde minimal
const DEFAULT_REQUIRED = ['CIP', 'QUITTANCE'];

const normalizeField = (v) => String(v || '').trim().toUpperCase();

exports.soumettre = async (utilisateurId, institutionId, body, files) => {
  const { typeDocument, semestres } = body;

  if (!typeDocument) {
    const err = new Error('typeDocument est requis');
    err.statusCode = 400;
    throw err;
  }

  const docKey = normalizeField(typeDocument);

  // req.files de multer.fields est un objet: { CIP: [file], QUITTANCE:[file], ... }
  const filesObj = files || {};
  const present = new Set(Object.keys(filesObj).map(normalizeField));

  // pièces requises selon le doc
  const required = REQUIRED_PIECES_BY_DOC[docKey] || DEFAULT_REQUIRED;
  const missing = required.filter((p) => !present.has(p));

  if (missing.length) {
    const err = new Error(
      `Pièces manquantes pour ${docKey}: ${missing.join(', ')}`
    );
    err.statusCode = 400;
    throw err;
  }

  // Aplatir toutes les pièces reçues
  const allFiles = Object.values(filesObj).flat();

  // Important : typePiece = fieldname (CIP / QUITTANCE / ACTE_NAISSANCE / JUSTIFICATIF_INSCRIPTION)
  // 👉 Assure-toi juste que ton enum Prisma (si tu en as un) contient bien ces valeurs.
  return prisma.demande.create({
    data: {
      typeDocument: docKey,
      semestres: Array.isArray(semestres)
        ? semestres.map((s) => parseInt(s, 10))
        : semestres
          ? [parseInt(semestres, 10)]
          : [],
      serviceCible: getServiceCible(docKey),
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
  const filtres = {
    ETUDIANT:           { utilisateurId: id },
    SECRETAIRE_ADJOINT: { institutionId, statut: 'SOUMISE' },
    SECRETAIRE_GENERAL: { institutionId, statut: 'TRANSMISE_SECRETAIRE_GENERAL' },
    CHEF_DIVISION:      { institutionId, statut: 'TRANSMISE_CHEF_DIVISION', serviceCible: service },
    DIRECTEUR_ADJOINT:  { institutionId, statut: 'ATTENTE_SIGNATURE_DIRECTEUR_ADJOINT' },
    DIRECTEUR:          { institutionId, statut: 'ATTENTE_SIGNATURE_DIRECTEUR' },
    SUPER_ADMIN:        { institutionId },
  };

  return prisma.demande.findMany({
    where: filtres[role] || {},
    include: {
      utilisateur: { select: { nom: true, prenom: true, numeroEtudiant: true } },
      pieces: true,
      documents: { select: { reference: true, downloadCount: true } },
    },
    // petit + UX: les plus récentes d’abord
    orderBy: { createdAt: 'desc' },
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
    include: { utilisateur: true },
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

  if (!peutAgir(role, demande.statut)) {
    const err = new Error('Action non permise pour votre rôle');
    err.statusCode = 403;
    throw err;
  }

  // Cas spécial : génération du document
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

    // 🔥 Si ce n’est pas un relevé → génération simple
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
      // 🔥 Cas RELEVE_NOTES → génération par semestre
      const semestres = demande.semestres?.length ? demande.semestres : [1];

      for (const semestre of semestres) {
        const reference = `ETD-${annee}-${sigle}-S${semestre}-${String(demande.id).substring(0,5).toUpperCase()}-${uuidv4().substring(0,4).toUpperCase()}`;
        const qrData = `${baseUrl}/verify/${reference}`;

        const pdfPath = await pdfService.generateDocument(
          { ...demande, semestre }, // on injecte le semestre dans le PDF
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

exports.validerPiece = async (pieceId, statut, commentaire, actorId) => {
  return prisma.pieceJustificative.update({
    where: { id: pieceId },
    data: { statut, commentaire, valideeParId: actorId, valideeAt: new Date() },
  });
};