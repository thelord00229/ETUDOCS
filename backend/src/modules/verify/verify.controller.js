const verifyService = require("./verify.service");

exports.verifier = async (req, res, next) => {
  try {
    const result = await verifyService.verifier(req.params.reference);
    return res.json(result);
  } catch (e) {
    return next(e);
  }
};