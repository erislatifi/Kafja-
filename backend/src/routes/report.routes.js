// ============================================================
// REPORT ROUTES
// ============================================================
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/report.controller');
const prisma = require('../config/db');
const { autentikoUser } = require('../middleware/auth.middleware');
const { lejoVetem } = require('../middleware/role.middleware');
const { eksportoRaportinPDF, eksportoRaportinExcel } = require('../services/export.service');

router.use(autentikoUser);

router.get('/dashboard', ctrl.dashboardData);
router.get('/ditor', ctrl.raportiDitor);
router.get('/mujor', ctrl.raportiMujor);
router.get('/sipas-perdoruesit', lejoVetem('ADMIN', 'MENAXHER'), ctrl.raportiSipasPerdoruesit);

// Eksport - rikrijon te dhenat e raportit ditor dhe i eksporton
router.get('/ditor/eksport/pdf', lejoVetem('ADMIN', 'MENAXHER'), async (req, res) => {
  try {
    req.query.data = req.query.data;
    const fakeRes = { json: (data) => eksportoRaportinPDF(res, data) };
    await ctrl.raportiDitor(req, fakeRes);
  } catch (err) {
    res.status(500).json({ gabim: 'Gabim ne eksportimin e PDF.' });
  }
});

router.get('/ditor/eksport/excel', lejoVetem('ADMIN', 'MENAXHER'), async (req, res) => {
  try {
    const fakeRes = { json: (data) => eksportoRaportinExcel(res, data) };
    await ctrl.raportiDitor(req, fakeRes);
  } catch (err) {
    res.status(500).json({ gabim: 'Gabim ne eksportimin e Excel.' });
  }
});

module.exports = router;
