const router = require('express').Router();
const ctrl = require('./document.controller');
const auth = require('../../middlewares/auth.middleware');

router.get('/download/:reference', auth, ctrl.telecharger);
router.delete('/:reference', auth, ctrl.supprimer);
router.get('/verify/:reference', ctrl.verifier);

module.exports = router;