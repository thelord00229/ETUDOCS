const router = require('express').Router();
const { verifier } = require('../document/document.controller');

router.get('/:reference', verifier);

module.exports = router;