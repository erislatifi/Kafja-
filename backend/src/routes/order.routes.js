// ============================================================
// ORDER ROUTES
// ============================================================
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/order.controller');
const { autentikoUser } = require('../middleware/auth.middleware');
const { lejoVetem } = require('../middleware/role.middleware');

router.use(autentikoUser);

router.get('/', ctrl.listoPorosite);
router.get('/:id', ctrl.merrPorosine);
router.post('/', lejoVetem('ADMIN', 'MENAXHER', 'ARKATAR', 'KAMERIER'), ctrl.krijoPorosine);
router.post('/:id/printo', lejoVetem('ADMIN', 'MENAXHER', 'ARKATAR', 'KAMERIER'), ctrl.printoPorosine);
router.post('/:id/anulo', lejoVetem('ADMIN', 'MENAXHER'), ctrl.anuloPorosine);

module.exports = router;
