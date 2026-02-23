const prisma = require('../../config/prisma');
const { peutAgir, getNextStatut } = require('../../utils/workflow');
const emailService = require('../../services/email.service');

const getServiceCible = (typeDocument) =>
  typeDocument === 'RELEVE_NOTES' ? 'EXAMENS' : 'SCOLARITE';

exports.soumettre = async (utilisateurId, institutionId, body, files) => {
  const { typeDocument, semestre } = body;

  const allFiles = files ? Object.values(files).flat() : [];

  return prisma.demande.create({
    data: {
      typeDocument,
      semestre: semestre ? parseInt(semestre) : null,
      serviceCible: getServiceCible(typeDocument),
      statut: 'SOUMISE',
      utilisateurId,
      institutionId,
      pieces: {
        create: allFiles.map(f => ({
          typePiece: f.fieldname.toUpperCase(),
          nom: f.originalname,
          url: f.path,
          statut: 'SOUMISE'
        }))
      },
      historique: {
        create: {
          statut: 'SOUMISE',
          commentaire: "Demande soumise par l'étudiant",
          actorId: utilisateurId
        }
      }
    },
    include: { pieces: true }
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
    SUPER_ADMIN:        { institutionId }
  };
  return prisma.demande.findMany({
    where: filtres[role] || {},
    include: {
      utilisateur: { select: { nom: true, prenom: true, numeroEtudiant: true } },
      pieces: true,
      document: { select: { reference: true, downloadCount: true } }
    },
    orderBy: { createdAt: 'asc' }
  });
};

exports.getById = async (demandeId, user) => {
  const demande = await prisma.demande.findUnique({
    where: { id: demandeId },
    include: {
      utilisateur: { select: { nom: true, prenom: true, email: true, numeroEtudiant: true } },
      pieces: true,
      document: true,
      historique: {
        include: { actor: { select: { nom: true, prenom: true, role: true } } },
        orderBy: { createdAt: 'asc' }
      }
    }
  });
  if (!demande) {
    const err = new Error('Demande introuvable'); err.statusCode = 404; throw err;
  }
  if (user.role === 'ETUDIANT' && demande.utilisateurId !== user.id) {
    const err = new Error('Accès refusé'); err.statusCode = 403; throw err;
  }
  return demande;
};

exports.avancer = async (demandeId, action, actorId, role, institutionId, commentaire) => {
  const demande = await prisma.demande.findUnique({
    where: { id: demandeId },
    include: { utilisateur: true }
  });

  if (!demande) {
    const err = new Error('Demande introuvable'); err.statusCode = 404; throw err;
  }
  if (demande.institutionId !== institutionId) {
    const err = new Error('Accès refusé'); err.statusCode = 403; throw err;
  }
  if (!peutAgir(role, demande.statut)) {
    const err = new Error('Action non permise pour votre rôle'); err.statusCode = 403; throw err;
  }

  // Cas spécial : génération du document
  if (action === 'GENERER_DOCUMENT') {
    const { v4: uuidv4 } = require('uuid');
    const pdfService = require('../../services/pdf.service');
    const qrcodeService = require('../../services/qrcode.service');

    // Vérifier qu'un document n'existe pas déjà
    const docExistant = await prisma.document.findUnique({
      where: { demandeId: demande.id }
    });
    if (docExistant) {
      const err = new Error('Un document existe déjà pour cette demande');
      err.statusCode = 400; throw err;
    }

    const institution = await prisma.institution.findUnique({
      where: { id: institutionId }
    });
    const etudiant = await prisma.utilisateur.findUnique({
      where: { id: demande.utilisateurId }
    });

    const annee = new Date().getFullYear();
    const sigle = institution.sigle || 'UAC';
    const shortId = uuidv4().substring(0, 4).toUpperCase();
    const reference = `ETD-${annee}-${sigle}-S${demande.semestre || 0}-${String(demande.id).substring(0,5).toUpperCase()}-${uuidv4().substring(0,4).toUpperCase()}`;
    const baseUrl = process.env.APP_URL || 'http://localhost:5000';
    const qrData = `${baseUrl}/verify/${reference}`;

    // En MVP : notes générées aléatoirement dans pdf.service.js
    // En production : appel API système notes université
    let notes = null;

    const pdfPath = await pdfService.generateDocument(
      demande, etudiant, notes, reference, institution, qrData
    );
    await qrcodeService.generate(qrData, reference);

    await prisma.document.create({
      data: {
        reference,
        qrPayload: qrData,
        urlPdf: pdfPath,
        demandeId: demande.id
      }
    });
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
          actorId
        }
      }
    }
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
    data: { statut, commentaire, valideeParId: actorId, valideeAt: new Date() }
  });
};