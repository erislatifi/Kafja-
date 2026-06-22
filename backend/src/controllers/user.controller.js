// ============================================================
// USER CONTROLLER - Menaxhimi i perdoruesve (vetem ADMIN)
// ============================================================
const bcrypt = require('bcryptjs');
const prisma = require('../config/db');

// GET /api/users
async function listoPerdoruesit(req, res) {
  try {
    const perdoruesit = await prisma.user.findMany({
      select: { id: true, emri: true, username: true, role: true, aktiv: true, krijuarMe: true },
      orderBy: { krijuarMe: 'asc' },
    });
    res.json(perdoruesit);
  } catch (err) {
    res.status(500).json({ gabim: 'Gabim ne server.' });
  }
}

// POST /api/users
async function krijoPerdoruesin(req, res) {
  try {
    const { emri, username, password, role } = req.body;

    if (!emri || !username || !password || !role) {
      return res.status(400).json({ gabim: 'Te gjitha fushat jane te detyrueshme.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ gabim: 'Fjalekalimi duhet te kete te pakten 6 karaktere.' });
    }
    if (!['ADMIN', 'MENAXHER', 'ARKATAR', 'KAMERIER'].includes(role)) {
      return res.status(400).json({ gabim: 'Roli i pavlefshem.' });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { emri, username, password: hashPassword, role },
      select: { id: true, emri: true, username: true, role: true, aktiv: true },
    });

    res.status(201).json(user);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ gabim: 'Ky username ekziston tashme.' });
    }
    console.error('Gabim ne krijimin e perdoruesit:', err);
    res.status(500).json({ gabim: 'Gabim ne server.' });
  }
}

// PUT /api/users/:id
async function perditesoPerdoruesin(req, res) {
  try {
    const { emri, role, aktiv, password } = req.body;

    const data = {};
    if (emri !== undefined) data.emri = emri;
    if (role !== undefined) data.role = role;
    if (aktiv !== undefined) data.aktiv = aktiv;
    if (password) {
      if (password.length < 6) return res.status(400).json({ gabim: 'Fjalekalimi duhet 6+ karaktere.' });
      data.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: { id: true, emri: true, username: true, role: true, aktiv: true },
    });

    res.json(user);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ gabim: 'Perdoruesi nuk u gjet.' });
    res.status(500).json({ gabim: 'Gabim ne server.' });
  }
}

// DELETE /api/users/:id (soft delete)
async function fshijPerdoruesin(req, res) {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ gabim: 'Nuk mund ta çaktivizoni vetveten.' });
    }
    await prisma.user.update({ where: { id: req.params.id }, data: { aktiv: false } });
    res.json({ mesazh: 'Perdoruesi u çaktivizua.' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ gabim: 'Perdoruesi nuk u gjet.' });
    res.status(500).json({ gabim: 'Gabim ne server.' });
  }
}

module.exports = { listoPerdoruesit, krijoPerdoruesin, perditesoPerdoruesin, fshijPerdoruesin };
