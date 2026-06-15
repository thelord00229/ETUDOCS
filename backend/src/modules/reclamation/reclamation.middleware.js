const service = require("./reclamation.service");

exports.verifyReclamationAccess = async (req, res, next) => {
  try {
    await service.getReclamationById(req.params.id, req.user);
    next();
  } catch (err) {
    next(err);
  }
};
