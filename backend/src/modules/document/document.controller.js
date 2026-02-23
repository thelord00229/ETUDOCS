const prisma = require('../../config/prisma');
const path = require('path');
const asyncHandler = require('../../utils/asyncHandler');

exports.telecharger = asyncHandler(async (req, res) => {
  const { reference } = req.params;
  const doc = await prisma.document.findUnique({
    where: { reference },
    include: { demande: true }
  });

  if (!doc) {
    return res.status(404).json({ message: 'Document introuvable' });
  }
  if (doc.demande.utilisateurId !== req.user.id) {
    return res.status(403).json({ message: 'Accès refusé' });
  }
  if (doc.downloadCount >= doc.maxDownloads) {
    return res.status(403).json({ message: 'Limite de téléchargement atteinte. Faites une nouvelle demande.' });
  }

  await prisma.document.update({
    where: { id: doc.id },
    data: { downloadCount: { increment: 1 } }
  });

  res.download(path.resolve(doc.urlPdf));
});

exports.verifier = asyncHandler(async (req, res) => {
  const { reference } = req.params;
  const doc = await prisma.document.findUnique({
    where: { reference },
    include: {
      demande: {
        include: {
          utilisateur: { select: { nom: true, prenom: true } },
          institution: { select: { nom: true, sigle: true } }
        }
      }
    }
  });

  if (!doc) {
    return res.json({ valide: false, message: 'Document non reconnu' });
  }

  const u = doc.demande.utilisateur;
  const nomMasque = `${u.prenom} ${u.nom.charAt(0)}${'*'.repeat(Math.max(u.nom.length - 2, 1))}${u.nom.slice(-1)}`;

  res.json({
    valide: true,
    reference: doc.reference,
    typeDocument: doc.demande.typeDocument,
    institution: doc.demande.institution.nom,
    sigle: doc.demande.institution.sigle,
    dateGeneration: doc.createdAt,
    nomMasque
  });
});