const express = require('express');
const router = express.Router();
const { autentikoUser } = require('../middleware/auth.middleware');
const { lejoVetem } = require('../middleware/role.middleware');
const prisma = require('../config/db');

router.use(autentikoUser);

// GET /api/tables
router.get('/', async (req, res) => {
  try {
    const tables = await prisma.table.findMany({
      where: { aktiv: true },
      orderBy: [{ pozicioniY: 'asc' }, { pozicioniX: 'asc' }]
    });

    // Shto statusin aktiv nga porositë
    const porosite = await prisma.order.findMany({
      where: { status: 'AKTIVE' },
      select: { tavolinaNr: true, totali: true, items: true }
    });

    const tavMap = {};
    for (const p of porosite) {
      if (!p.tavolinaNr) continue;
      if (!tavMap[p.tavolinaNr]) tavMap[p.tavolinaNr] = { totali: 0 };
      tavMap[p.tavolinaNr].totali += Number(p.totali);
    }

    const result = tables.map(t => ({
      ...t,
      aktive: !!(tavMap[t.numri]),
      totali: tavMap[t.numri]?.totali || 0
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ gabim: 'Gabim ne server.' });
  }
});

// POST /api/tables
router.post('/', lejoVetem('ADMIN', 'MENAXHER'), async (req, res) => {
  try {
    const { numri, emri, pozicioniX, pozicioniY } = req.body;
    const table = await prisma.table.create({
      data: { numri, emri: emri || null, pozicioniX: pozicioniX || 0, pozicioniY: pozicioniY || 0 }
    });
    res.json(table);
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ gabim: 'Ky numër tavolinë ekziston.' });
    res.status(500).json({ gabim: 'Gabim ne server.' });
  }
});

// PUT /api/tables/:id
router.put('/:id', lejoVetem('ADMIN', 'MENAXHER', 'KAMERIER', 'ARKATAR'), async (req, res) => {
  try {
    const { emri, numri, pozicioniX, pozicioniY } = req.body;
    const data = {};
    if (emri !== undefined) data.emri = emri || null;
    if (numri !== undefined) data.numri = parseInt(numri);
    if (pozicioniX !== undefined) data.pozicioniX = parseInt(pozicioniX);
    if (pozicioniY !== undefined) data.pozicioniY = parseInt(pozicioniY);
    const table = await prisma.table.update({ where: { id: String(req.params.id) }, data });
    res.json(table);
  } catch (err) {
    res.status(500).json({ gabim: 'Gabim ne server.' });
  }
});

// DELETE /api/tables/:id
router.delete('/:id', lejoVetem('ADMIN', 'MENAXHER'), async (req, res) => {
  try {
    await prisma.table.delete({ where: { id: String(req.params.id) } });
    res.json({ mesazh: 'Tavolina u fshi.' });
  } catch (err) {
    res.status(500).json({ gabim: 'Gabim ne server.' });
  }
});

module.exports = router;
