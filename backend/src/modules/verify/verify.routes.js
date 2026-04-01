const router = require("express").Router();
const verifyController = require("./verify.controller");

router.get("/:reference", verifyController.verifier);

module.exports = router;