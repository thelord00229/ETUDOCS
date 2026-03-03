const prisma = require("../../config/prisma");
const asyncHandler = require("../../utils/asyncHandler");

exports.me = asyncHandler(async (req, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ message: "Non authentifié" });
  }

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

      institutionId: true,
      institution: {
        select: {
          id: true,
          nom: true,
          sigle: true,   // ex: "IFRI" / "EPAC" / "FSS"
          logoUrl: true, // si tu utilises une URL côté backend
        },
      },

      emailVerifie: true,
      actif: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    return res.status(404).json({ message: "Utilisateur introuvable" });
  }

  // Champ pratique pour piloter l'UI côté frontend
  const institutionCode = user.institution?.sigle || null;

  return res.json({ ...user, institutionCode });
});