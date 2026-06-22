// ============================================================
// USER ROUTES (vetem ADMIN)
// ============================================================
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/user.controller');
const { autentikoUser } = require('../middleware/auth.middleware');
const { lejoVetem } = require('../middleware/role.middleware');

router.use(autentikoUser, lejoVetem('ADMIN'));

router.get('/', ctrl.listoPerdoruesit);
router.post('/', ctrl.krijoPerdoruesin);
router.put('/:id', ctrl.perditesoPerdoruesin);
router.delete('/:id', ctrl.fshijPerdoruesin);

module.exports = router;
