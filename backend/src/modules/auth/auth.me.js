const prisma = require('../../config/prisma');
const asyncHandler = require('../../utils/asyncHandler');

exports.me = asyncHandler(async (req, res) => {
  // req.user vient du token (auth.middleware)
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
      institutionId: true,
      actif: true,
      emailVerifie: true
    }
  });

  if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
  res.json(user);
});