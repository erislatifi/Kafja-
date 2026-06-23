const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/order.controller');
const { autentikoUser } = require('../middleware/auth.middleware');
const { lejoVetem } = require('../middleware/role.middleware');

router.use(autentikoUser);

router.get('/', ctrl.listoPorosite);
router.get('/table/:tavolinaNr', ctrl.porositeETabeolnes);
router.get('/:id', ctrl.merrPorosine);
router.post('/', ctrl.krijoPorosine);
router.post('/table/:tavolinaNr/mbyll', ctrl.mbyllTavolinen);
router.post('/:id/printo', ctrl.printoPorosine);
router.post('/:id/anulo', lejoVetem('ADMIN', 'MENAXHER'), ctrl.anuloPorosine);

module.exports = router;
