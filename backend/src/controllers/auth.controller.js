const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

// POST /api/auth/login (username + password)
async function login(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ gabim: 'Username dhe fjalekalimi jane te detyrueshem.' });

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !user.aktiv) return res.status(401).json({ gabim: 'Username ose fjalekalim i pasakte.' });

    const sakte = await bcrypt.compare(password, user.password);
    if (!sakte) return res.status(401).json({ gabim: 'Username ose fjalekalim i pasakte.' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '12h' });
    res.json({ token, user: { id: user.id, emri: user.emri, username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ gabim: 'Gabim ne server.' });
  }
}

// POST /api/auth/login-pin (PIN 4 shifra)
async function loginWithPin(req, res) {
  try {
    const { pin } = req.body;
    if (!pin || String(pin).length !== 4) return res.status(400).json({ gabim: 'PIN duhet te jete 4 shifra.' });

    // Kerkoje perdoruesin me kete PIN (perdoruesit e ruajne PIN-in ne fushen pin)
    let userGjetur = await prisma.user.findFirst({ where: { pin: String(pin), aktiv: true } });

    // Nese nuk gjejmë, kontrollojmë password (per admin default)
    if (!userGjetur) {
      const perdoruesit = await prisma.user.findMany({ where: { aktiv: true } });
      for (const u of perdoruesit) {
        try {
          const match = await bcrypt.compare(String(pin), u.password);
          if (match) { userGjetur = u; break; }
        } catch { }
      }
    }

    if (!userGjetur) return res.status(401).json({ gabim: 'PIN i pasakte.' });

    const token = jwt.sign({ id: userGjetur.id, role: userGjetur.role }, process.env.JWT_SECRET, { expiresIn: '12h' });
    res.json({ token, user: { id: userGjetur.id, emri: userGjetur.emri, username: userGjetur.username, role: userGjetur.role } });
  } catch (err) {
    console.error('PIN login error:', err);
    res.status(500).json({ gabim: 'Gabim ne server.' });
  }
}

async function meCurrent(req, res) {
  res.json({ user: req.user });
}

async function ndryshoFjalekalimin(req, res) {
  try {
    const { fjalekalimiVjeter, fjalekalimiRi } = req.body;
    if (!fjalekalimiVjeter || !fjalekalimiRi) return res.status(400).json({ gabim: 'Te dy fjalekalimet jane te detyrueshme.' });
    if (fjalekalimiRi.length < 4) return res.status(400).json({ gabim: 'Fjalekalimi i ri duhet te kete te pakten 4 karaktere.' });

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const sakte = await bcrypt.compare(fjalekalimiVjeter, user.password);
    if (!sakte) return res.status(400).json({ gabim: 'Fjalekalimi aktual eshte i pasakte.' });

    const hashRi = await bcrypt.hash(fjalekalimiRi, 10);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashRi } });
    res.json({ mesazh: 'Fjalekalimi u ndryshua.' });
  } catch (err) {
    res.status(500).json({ gabim: 'Gabim ne server.' });
  }
}

module.exports = { login, meCurrent, ndryshoFjalekalimin, loginWithPin };
