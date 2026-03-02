const prisma = require('../../config/prisma');
const asyncHandler = require('../../utils/asyncHandler');

exports.me = asyncHandler(async (req, res) => {
  try {
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
            sigle: true,
            logoUrl: true,
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

    return res.json(user);
  } catch (e) {
    console.error("[AUTH_ME]", e);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});