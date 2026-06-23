// ============================================================
// PRINTER ROUTES
// ============================================================
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/printer.controller');
const { autentikoUser } = require('../middleware/auth.middleware');
const { lejoVetem } = require('../middleware/role.middleware');

router.use(autentikoUser);

router.get('/', ctrl.listoPrinteret);
router.post('/', lejoVetem('ADMIN', 'MENAXHER'), ctrl.krijoPrinterin);
router.put('/:id', lejoVetem('ADMIN', 'MENAXHER'), ctrl.perditesoPrinterin);
router.delete('/:id', lejoVetem('ADMIN'), ctrl.fshijPrinterin);
router.post('/:id/test', lejoVetem('ADMIN', 'MENAXHER'), ctrl.testoPrinterin);

module.exports = router;
