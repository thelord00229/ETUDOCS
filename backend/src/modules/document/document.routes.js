const router = require('express').Router();
const ctrl = require('./document.controller');
const auth = require('../../middlewares/auth.middleware');

router.get('/download/:reference', auth, ctrl.telecharger);

module.exports = router;