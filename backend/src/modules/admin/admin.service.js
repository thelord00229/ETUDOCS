const prisma = require('../../config/prisma');
const bcrypt = require('bcryptjs');

// Créer un compte agent
exports.creerAgent = async ({ nom, prenom, email, password, role, service, institutionId }) => {
  const existing = await prisma.utilisateur.findUnique({ where: { email } });
  if (existing) {
    const err = new Error('Cet email est déjà utilisé');
    err.statusCode = 400; throw err;
  }

  const hash = await bcrypt.hash(password, 12);
  return prisma.utilisateur.create({
    data: {
      nom, prenom, email,
      password: hash,
      role, service: service || null,
      institutionId,
      emailVerifie: true,
      actif: true
    },
    select: {
      id: true, nom: true, prenom: true,
      email: true, role: true, service: true,
      institutionId: true, actif: true
    }
  });
};

// Lister les agents d'une institution
exports.getAgents = async (institutionId) => {
  return prisma.utilisateur.findMany({
    where: {
      institutionId,
      role: { not: 'ETUDIANT' }
    },
    select: {
      id: true, nom: true, prenom: true,
      email: true, role: true, service: true,
      actif: true, createdAt: true
    },
    orderBy: { createdAt: 'asc' }
  });
};

// Activer ou désactiver un compte
exports.toggleActif = async (userId) => {
  const user = await prisma.utilisateur.findUnique({ where: { id: userId } });
  if (!user) {
    const err = new Error('Utilisateur introuvable');
    err.statusCode = 404; throw err;
  }
  return prisma.utilisateur.update({
    where: { id: userId },
    data: { actif: !user.actif },
    select: { id: true, nom: true, prenom: true, actif: true }
  });
};

// Configurer une institution
exports.configurerInstitution = async (institutionId, data) => {
  return prisma.institution.update({
    where: { id: institutionId },
    data: {
      nom:                  data.nom                  || undefined,
      directeurNom:         data.directeurNom         || undefined,
      directeurTitre:       data.directeurTitre       || undefined,
      directeurAdjointNom:  data.directeurAdjointNom  || undefined,
      directeurAdjointTitre:data.directeurAdjointTitre|| undefined,
      signatureDirecteurUrl:        data.signatureDirecteurUrl        || undefined,
      signatureDirecteurAdjointUrl: data.signatureDirecteurAdjointUrl || undefined,
      tamponDirecteurUrl:           data.tamponDirecteurUrl           || undefined,
      tamponDirecteurAdjointUrl:    data.tamponDirecteurAdjointUrl    || undefined,
    }
  });
};

// Statistiques globales
exports.getStatistiques = async (institutionId) => {
  const total = await prisma.demande.count({ where: { institutionId } });
  const parStatut = await prisma.demande.groupBy({
    by: ['statut'],
    where: { institutionId },
    _count: { statut: true }
  });
  const disponibles = await prisma.document.count({
    where: { demande: { institutionId } }
  });

  return {
    total,
    disponibles,
    parStatut: parStatut.map(s => ({
      statut: s.statut,
      count: s._count.statut
    }))
  };
};