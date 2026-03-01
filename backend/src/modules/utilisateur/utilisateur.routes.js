const router = require('express').Router();
const ctrl = require('./utilisateur.controller');
const auth = require('../../middlewares/auth.middleware');

// ✅ PATCH /api/utilisateurs/profil
router.patch('/profil', auth, ctrl.updateProfil);

module.exports = router;