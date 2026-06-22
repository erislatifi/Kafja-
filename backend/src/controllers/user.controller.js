const bcrypt = require('bcryptjs');
const prisma = require('../config/db');

// GET /api/users
async function listoPerdoruesit(req, res) {
  try {
    const perdoruesit = await prisma.user.findMany({
      select: { id: true, emri: true, username: true, role: true, aktiv: true, pin: true, krijuarMe: true },
      orderBy: { krijuarMe: 'asc' },
    });
    res.json(perdoruesit);
  } catch (err) {
    res.status(500).json({ gabim: 'Gabim ne server.' });
  }
}

// POST /api/users - krijon perdorues me PIN
async function krijoPerdoruesin(req, res) {
  try {
    const { emri, username, password, role, pin } = req.body;

    if (!emri || !username || !role) {
      return res.status(400).json({ gabim: 'Emri, username dhe roli jane te detyrueshme.' });
    }
    if (!['ADMIN', 'MENAXHER', 'ARKATAR', 'KAMERIER'].includes(role)) {
      return res.status(400).json({ gabim: 'Roli i pavlefshem.' });
    }
    if (!pin && !password) {
      return res.status(400).json({ gabim: 'Duhet te vendosni PIN ose fjalekalim.' });
    }
    if (pin && pin.length < 4) {
      return res.status(400).json({ gabim: 'PIN duhet te kete te pakten 4 karaktere.' });
    }
    if (password && password.length < 4) {
      return res.status(400).json({ gabim: 'Fjalekalimi duhet te kete te pakten 4 karaktere.' });
    }

    // Fjalekalimi - nese nuk jepet, perdor PIN si fjalekalim
    const fjalekalimiPerHash = password || pin;
    const hashPassword = await bcrypt.hash(fjalekalimiPerHash, 10);

    const user = await prisma.user.create({
      data: {
        emri,
        username,
        password: hashPassword,
        role,
        pin: pin || null,
        aktiv: true,
      },
      select: { id: true, emri: true, username: true, role: true, aktiv: true, pin: true },
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

// PUT /api/users/:id - edito perdoruesin + PIN
async function perditesoPerdoruesin(req, res) {
  try {
    const { emri, role, aktiv, password, pin } = req.body;

    const data = {};
    if (emri !== undefined) data.emri = emri;
    if (role !== undefined) data.role = role;
    if (aktiv !== undefined) data.aktiv = aktiv;
    if (pin !== undefined) data.pin = pin || null;
    if (password) {
      if (password.length < 4) return res.status(400).json({ gabim: 'Fjalekalimi duhet 4+ karaktere.' });
      data.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: { id: true, emri: true, username: true, role: true, aktiv: true, pin: true },
    });

    res.json(user);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ gabim: 'Perdoruesi nuk u gjet.' });
    res.status(500).json({ gabim: 'Gabim ne server.' });
  }
}

// DELETE /api/users/:id - fshirje e vertete
async function fshijPerdoruesin(req, res) {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ gabim: 'Nuk mund ta fshini vetveten.' });
    }
    // Fshi porositë e lidhura fillimisht
    const orders = await prisma.order.findMany({ where: { userId: req.params.id }, select: { id: true } });
    const orderIds = orders.map(o => o.id);
    if (orderIds.length > 0) {
      await prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
      await prisma.stockMovement.deleteMany({ where: { orderId: { in: orderIds } } });
      await prisma.order.deleteMany({ where: { id: { in: orderIds } } });
    }
    await prisma.stockMovement.deleteMany({ where: { userId: req.params.id } });
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ mesazh: 'Perdoruesi u fshi.' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ gabim: 'Perdoruesi nuk u gjet.' });
    console.error('Gabim ne fshirjen e perdoruesit:', err);
    res.status(500).json({ gabim: 'Gabim ne server.' });
  }
}

module.exports = { listoPerdoruesit, krijoPerdoruesin, perditesoPerdoruesin, fshijPerdoruesin };
