const auth = require('../../middlewares/auth.middleware');
const { me } = require('./auth.me');

const router = require('express').Router();
const ctrl = require('./auth.controller');

router.post('/register',              ctrl.register);
router.get('/me',                auth, me);
router.post('/login',                 ctrl.login);
router.get('/verify/:token',          ctrl.verifyEmail);
router.post('/reset-password',        ctrl.requestReset);
router.post('/reset-password/:token', ctrl.resetPassword);

// ✅ Changer le mot de passe (authentifié)
router.post('/change-password', auth, ctrl.changePassword);

module.exports = router;