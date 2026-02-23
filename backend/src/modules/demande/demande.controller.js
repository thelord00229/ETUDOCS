const service = require('./demande.service');
const asyncHandler = require('../../utils/asyncHandler');

exports.soumettre = asyncHandler(async (req, res) => {
  res.status(201).json(
    await service.soumettre(req.user.id, req.user.institutionId, req.body, req.files || [])
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