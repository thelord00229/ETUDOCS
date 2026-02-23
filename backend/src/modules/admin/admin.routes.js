const router = require('express').Router();
const ctrl = require('./admin.controller');
const auth = require('../../middlewares/auth.middleware');
const role = require('../../middlewares/role.middleware');

// Toutes les routes admin nécessitent d'être connecté et SUPER_ADMIN
router.post('/agents',                          auth, role('SUPER_ADMIN'), ctrl.creerAgent);
router.get('/agents',                           auth, role('SUPER_ADMIN'), ctrl.getAgents);
router.patch('/agents/:userId/toggle',          auth, role('SUPER_ADMIN'), ctrl.toggleActif);
router.put('/institutions/:institutionId',      auth, role('SUPER_ADMIN'), ctrl.configurerInstitution);
router.get('/statistiques',                     auth, role('SUPER_ADMIN'), ctrl.getStatistiques);

module.exports = router;