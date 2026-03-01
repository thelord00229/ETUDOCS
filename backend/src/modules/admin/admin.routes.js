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
router.get('/institutions', auth, role('SUPER_ADMIN'), ctrl.getInstitutions);
router.get('/model-notes', auth, role('SUPER_ADMIN'), (req, res) => {
  const filePath = path.join(__dirname, '../../templates/model_notes.xlsx');
  res.download(filePath, 'modele_notes.xlsx');
});

module.exports = router;
