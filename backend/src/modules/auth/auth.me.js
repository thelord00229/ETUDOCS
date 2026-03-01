const prisma = require('../../config/prisma');
const asyncHandler = require('../../utils/asyncHandler');

exports.me = asyncHandler(async (req, res) => {
  const user = await prisma.utilisateur.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      nom: true,
      prenom: true,
      email: true,
      role: true,
      service: true,
      numeroEtudiant: true,
      filiere: true,
      niveau: true,
      actif: true,
      emailVerifie: true,
      createdAt: true,
      institution: {
        select: { id: true, nom: true, sigle: true }
      }
    }
  });

  if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
  res.json(user);
});