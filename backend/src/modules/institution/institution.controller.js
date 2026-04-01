const institutionService = require("./institution.service");

exports.getInstitutions = async (req, res, next) => {
  try {
    const institutions = await institutionService.getInstitutions();
    return res.json(institutions);
  } catch (e) {
    return next(e);
  }
};