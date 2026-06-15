const asyncHandler = require("../../utils/asyncHandler");
const service = require("./reclamation.service");

const normalize = (value) => String(value || "").trim();

function uploadedUrls(files) {
  if (!Array.isArray(files)) return [];
  return files.map((file) => file.path).filter(Boolean);
}

exports.create = asyncHandler(async (req, res) => {
  const piecesJointes =
    uploadedUrls(req.files) ||
    (Array.isArray(req.body?.piecesJointes) ? req.body.piecesJointes : []);

  const reclamation = await service.createReclamation({
    user: req.user,
    documentId: req.body?.documentId,
    type: req.body?.type,
    description: req.body?.description,
    piecesJointes,
  });

  res.status(201).json(reclamation);
});

exports.list = asyncHandler(async (req, res) => {
  res.json(await service.getReclamations({ filters: req.query, user: req.user }));
});

exports.mesReclamations = asyncHandler(async (req, res) => {
  res.json(await service.getMesReclamations(req.user));
});

exports.detail = asyncHandler(async (req, res) => {
  res.json(await service.getReclamationById(req.params.id, req.user));
});

exports.prendreEnCharge = asyncHandler(async (req, res) => {
  res.json(
    await service.prendreEnCharge({
      id: req.params.id,
      agentId: normalize(req.body?.agentId) || null,
      user: req.user,
    })
  );
});

exports.resoudre = asyncHandler(async (req, res) => {
  res.json(
    await service.resoudreReclamation({
      id: req.params.id,
      user: req.user,
      action: req.body?.action,
      reponseAgent: req.body?.reponseAgent,
      corrections: req.body?.corrections,
    })
  );
});

exports.stats = asyncHandler(async (req, res) => {
  res.json(await service.getStats(req.user));
});
