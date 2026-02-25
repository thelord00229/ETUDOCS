const adminService = require('./admin.service');
const asyncHandler = require('../../utils/asyncHandler');

exports.creerAgent = asyncHandler(async (req, res) => {
  const result = await adminService.creerAgent({
    ...req.body,
    institutionId: req.body.institutionId || req.user.institutionId
  });
  res.status(201).json(result);
});

exports.getAgents = asyncHandler(async (req, res) => {
  const institutionId = req.query.institutionId || req.user.institutionId;
  const agents = await adminService.getAgents(institutionId);
  res.json(agents);
});

exports.toggleActif = asyncHandler(async (req, res) => {
  const result = await adminService.toggleActif(req.params.userId);
  res.json(result);
});

exports.configurerInstitution = asyncHandler(async (req, res) => {
  const institutionId = req.params.institutionId || req.user.institutionId;
  const result = await adminService.configurerInstitution(institutionId, req.body);
  res.json(result);
});

exports.getStatistiques = asyncHandler(async (req, res) => {
  const institutionId = req.query.institutionId || req.user.institutionId;
  const stats = await adminService.getStatistiques(institutionId);
  res.json(stats);
});

exports.getInstitutions = asyncHandler(async (req, res) => {
  const institutions = await adminService.getInstitutions();
  res.json(institutions);
});