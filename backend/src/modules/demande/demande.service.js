const prisma = require('../../config/prisma');
const { peutAgir, getNextStatut } = require('../../utils/workflow');
const emailService = require('../../services/email.service');

const getServiceCible = (typeDocument) =>
  typeDocument === 'RELEVE_NOTES' ? 'EXAMENS' : 'SCOLARITE';

exports.soumettre = async (utilisateurId, institutionId, body, files) => {
  const { typeDocument, semestre } = body;

  // Transformer req.files (objet) en tableau
  const allFiles = files
    ? Object.values(files).flat()
    : [];

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
  await emailService.sendStatutChange(
    demande.utilisateur.email,
    demande.utilisateur.prenom,
    prochainStatut
  );
  return updated;
};

exports.validerPiece = async (pieceId, statut, commentaire, actorId) => {
  return prisma.pieceJustificative.update({
    where: { id: pieceId },
    data: { statut, commentaire, valideeParId: actorId, valideeAt: new Date() }
  });
};