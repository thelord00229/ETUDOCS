const service = require("./demande.service");
const asyncHandler = require("../../utils/asyncHandler");

const normalize = (v) => String(v || "").trim();
const normalizeUpper = (v) => normalize(v).toUpperCase();

const hasFile = (files, key) =>
  !!(files && files[key] && Array.isArray(files[key]) && files[key].length > 0);

const MAX_COMMENTAIRE_LEN = 500;

function badRequest(res, message, extra = {}) {
  return res.status(400).json({ message, ...extra });
}

exports.soumettre = asyncHandler(async (req, res) => {
  const files = req.files || {};
  const typeDocumentRaw = req.body?.typeDocument;
  const typeDocument = normalizeUpper(typeDocumentRaw);

  if (!typeDocument) return badRequest(res, "typeDocument est requis.");

  const hasAnyFile = Object.keys(files).some((k) => hasFile(files, k));
  if (!hasAnyFile)
    return badRequest(res, "Aucune pièce jointe détectée. Veuillez uploader vos pièces.");

  const created = await service.soumettre(
    req.user.id,
    req.user.institutionId,
    { ...req.body, typeDocument },
    files
  );

  return res.status(201).json(created);
});

exports.getDemandes = asyncHandler(async (req, res) => {
  res.json(await service.getDemandes(req.user));
});

exports.getById = asyncHandler(async (req, res) => {
  res.json(await service.getById(req.params.id, req.user));
});

exports.avancer = asyncHandler(async (req, res) => {
  const action = normalizeUpper(req.body?.action);
  if (!action) return badRequest(res, "action est requise.");

  const commentaireRaw = req.body?.commentaire;
  const commentaire = commentaireRaw == null ? null : normalize(commentaireRaw);

  if (commentaire && commentaire.length > MAX_COMMENTAIRE_LEN)
    return badRequest(res, `commentaire trop long (max ${MAX_COMMENTAIRE_LEN} caractères).`);

  const updated = await service.avancer(
    req.params.id,
    action,
    req.user.id,
    req.user.role,
    req.user.institutionId,
    commentaire
  );

  res.json(updated);
});

exports.validerPiece = asyncHandler(async (req, res) => {
  const statut = normalizeUpper(req.body?.statut);
  if (!["VALIDEE", "REJETEE"].includes(statut))
    return badRequest(res, "statut invalide. Attendu: VALIDEE ou REJETEE.");

  const commentaireRaw = req.body?.commentaire;
  const commentaire = commentaireRaw == null ? null : normalize(commentaireRaw);

  if (commentaire && commentaire.length > MAX_COMMENTAIRE_LEN)
    return badRequest(res, `commentaire trop long (max ${MAX_COMMENTAIRE_LEN} caractères).`);

  const userService =
    req.user.service || req.user.serviceId || req.user.division || req.user.departement || null;

  res.json(
    await service.validerPiece(
      req.params.pieceId,
      statut,
      commentaire,
      req.user.id,
      req.user.role,
      req.user.institutionId,
      userService
    )
  );
});

exports.getStatsChefDivision = asyncHandler(async (req, res) => {
  res.json(await service.getStatsChefDivision(req.user));
});

// ✅ NOUVEAU : stats Directeur Adjoint
exports.getStatsDA = asyncHandler(async (req, res) => {
  res.json(await service.getStatsDA(req.user));
});

exports.getStatsSG = asyncHandler(async (req, res) => {
  res.json(await service.getStatsSG(req.user));
});