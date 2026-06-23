// ============================================================
// STOCK ROUTES
// ============================================================
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/stock.controller');
const { autentikoUser } = require('../middleware/auth.middleware');
const { lejoVetem } = require('../middleware/role.middleware');

router.use(autentikoUser);

router.get('/alarm', ctrl.produktetMeAlarm);
router.get('/historia/:productId', ctrl.historiaProduktit);
router.get('/snapshot-ditor', ctrl.snapshotDitor);
router.post('/snapshot-ditor/krijo', lejoVetem('ADMIN', 'MENAXHER'), ctrl.krijoSnapshotDitor);

router.post('/shto', lejoVetem('ADMIN', 'MENAXHER'), ctrl.shtoStok);
router.post('/korrigjo', lejoVetem('ADMIN', 'MENAXHER'), ctrl.korrigjoStok);

module.exports = router;
