// ============================================================
// PRODUCT ROUTES
// ============================================================
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/product.controller');
const { autentikoUser } = require('../middleware/auth.middleware');
const { lejoVetem } = require('../middleware/role.middleware');

router.use(autentikoUser); // te gjitha rutat kerkojne kycje

// Kategorite (vendosur para /:id qe te mos kete konflikt rrugesh)
router.get('/categories/all', ctrl.listoKategorite);
router.post('/categories', lejoVetem('ADMIN', 'MENAXHER'), ctrl.krijoKategorine);

// Produktet - leximi i lejuar per te gjithe rolet e kycura
router.get('/', ctrl.listoProduktet);
router.get('/:id', ctrl.merrProduktin);

// Shkrimi - vetem ADMIN dhe MENAXHER
router.post('/', lejoVetem('ADMIN', 'MENAXHER'), ctrl.krijoProduktin);
router.put('/:id', lejoVetem('ADMIN', 'MENAXHER'), ctrl.perditesoProduktin);
router.delete('/:id', lejoVetem('ADMIN', 'MENAXHER'), ctrl.fshijProduktin);

module.exports = router;
