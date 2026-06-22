// ============================================================
// AUTH CONTROLLER - Login dhe menaxhim sesioni
// ============================================================
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

// POST /api/auth/login
async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ gabim: 'Username dhe fjalekalimi jane te detyrueshem.' });
    }

    const user = await prisma.user.findUnique({ where: { username } });

    if (!user || !user.aktiv) {
      return res.status(401).json({ gabim: 'Username ose fjalekalim i pasakte.' });
    }

    const passwordSakte = await bcrypt.compare(password, user.password);
    if (!passwordSakte) {
      return res.status(401).json({ gabim: 'Username ose fjalekalim i pasakte.' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '12h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        emri: user.emri,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Gabim ne login:', err);
    res.status(500).json({ gabim: 'Gabim ne server. Provoni perseri.' });
  }
}

// GET /api/auth/me - kthen te dhenat e perdoruesit te kyçur
async function meCurrent(req, res) {
  res.json({ user: req.user });
}

// POST /api/auth/change-password
async function ndryshoFjalekalimin(req, res) {
  try {
    const { fjalekalimiVjeter, fjalekalimiRi } = req.body;

    if (!fjalekalimiVjeter || !fjalekalimiRi) {
      return res.status(400).json({ gabim: 'Te dy fjalekalimet jane te detyrueshem.' });
    }
    if (fjalekalimiRi.length < 6) {
      return res.status(400).json({ gabim: 'Fjalekalimi i ri duhet te kete te pakten 6 karaktere.' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const sakte = await bcrypt.compare(fjalekalimiVjeter, user.password);

    if (!sakte) {
      return res.status(400).json({ gabim: 'Fjalekalimi aktual eshte i pasakte.' });
    }

    const hashRi = await bcrypt.hash(fjalekalimiRi, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashRi },
    });

    res.json({ mesazh: 'Fjalekalimi u ndryshua me sukses.' });
  } catch (err) {
    console.error('Gabim ne ndryshim fjalekalimi:', err);
    res.status(500).json({ gabim: 'Gabim ne server.' });
  }
}

module.exports = { login, meCurrent, ndryshoFjalekalimin };
