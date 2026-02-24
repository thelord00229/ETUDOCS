const service = require('./demande.service');
const asyncHandler = require('../../utils/asyncHandler');

const hasFile = (files, key) => {
  return !!(files && files[key] && Array.isArray(files[key]) && files[key].length > 0);
};

exports.soumettre = asyncHandler(async (req, res) => {
  const files = req.files || {};
  const typeDocument = req.body?.typeDocument;

  // ✅ règle actuelle (selon ce que tu as décrit)
  // Relevé de notes + Attestation d'inscription => 4 pièces obligatoires
  const needFourPieces = ['RELEVE_NOTES', 'ATTESTATION_INSCRIPTION'].includes(typeDocument);

  const required = needFourPieces
    ? ['CIP', 'QUITTANCE', 'ACTE_NAISSANCE', 'JUSTIFICATIF_INSCRIPTION']
    : ['CIP', 'QUITTANCE'];

  const missing = required.filter((k) => !hasFile(files, k));

  if (!typeDocument) {
    return res.status(400).json({ message: "typeDocument est requis." });
  }

  if (missing.length > 0) {
    return res.status(400).json({
      message: "Pièces manquantes pour soumettre la demande.",
      missingPieces: missing
    });
  }

  res.status(201).json(
    await service.soumettre(req.user.id, req.user.institutionId, req.body, files)
  );
});

exports.getDemandes = asyncHandler(async (req, res) => {
  res.json(await service.getDemandes(req.user));
});

exports.getById = asyncHandler(async (req, res) => {
  res.json(await service.getById(req.params.id, req.user));
});

exports.avancer = asyncHandler(async (req, res) => {
  res.json(
    await service.avancer(
      req.params.id,
      req.body.action,
      req.user.id,
      req.user.role,
      req.user.institutionId,
      req.body.commentaire
    )
  );
});

exports.validerPiece = asyncHandler(async (req, res) => {
  res.json(
    await service.validerPiece(
      req.params.pieceId,
      req.body.statut,
      req.body.commentaire,
      req.user.id
    )
  );
});