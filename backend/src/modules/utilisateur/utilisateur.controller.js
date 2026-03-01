const prisma = require('../../config/prisma');
const asyncHandler = require('../../utils/asyncHandler');

// ✅ Mettre à jour le profil de l'étudiant connecté
exports.updateProfil = asyncHandler(async (req, res) => {
  const { nom, prenom, filiere, niveau } = req.body;

  const updated = await prisma.utilisateur.update({
    where: { id: req.user.id },
    data: {
      ...(nom     && { nom }),
      ...(prenom  && { prenom }),
      ...(filiere !== undefined && { filiere }),
      ...(niveau  !== undefined && { niveau }),
    },
    select: {
      id: true,
      nom: true,
      prenom: true,
      email: true,
      filiere: true,
      niveau: true,
      numeroEtudiant: true,
      institution: { select: { nom: true, sigle: true } },
    }
  });

  res.json(updated);
});