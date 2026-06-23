const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

function bejToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '12h' }
  );
}

function pergatitPerdoruesin(u) {
  return { id: u.id, emri: u.emri, username: u.username, role: u.role };
}

// POST /api/auth/login (username + password)
async function login(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ gabim: 'Username dhe fjalekalimi jane te detyrueshem.' });
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !user.aktiv) return res.status(401).json({ gabim: 'Username ose fjalekalim i pasakte.' });
    const sakte = await bcrypt.compare(password, user.password);
    if (!sakte) return res.status(401).json({ gabim: 'Username ose fjalekalim i pasakte.' });
    res.json({ token: bejToken(user), user: pergatitPerdoruesin(user) });
  } catch { res.status(500).json({ gabim: 'Gabim ne server.' }); }
}

// POST /api/auth/login-pin
// PIN mund te jete çfaredo gjatesie (4+)
// Lexuesi RFID/barcode dergon numrin si input automatikisht
async function loginWithPin(req, res) {
  try {
    const { pin } = req.body;
    const kodi = String(pin || '').trim();

    if (kodi.length < 4) {
      return res.status(400).json({ gabim: 'Kodi duhet te kete te pakten 4 karaktere.' });
    }

    // Kerko perdoruesin me kete PIN (fusha pin ne database)
    const user = await prisma.user.findFirst({
      where: { pin: kodi, aktiv: true }
    });

    if (!user) {
      return res.status(401).json({ gabim: 'PIN i pasakte. Provoni perseri.' });
    }

    res.json({ token: bejToken(user), user: pergatitPerdoruesin(user) });
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
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const sakte = await bcrypt.compare(fjalekalimiVjeter, user.password);
    if (!sakte) return res.status(400).json({ gabim: 'Fjalekalimi aktual eshte i pasakte.' });
    const hashRi = await bcrypt.hash(fjalekalimiRi, 10);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashRi } });
    res.json({ mesazh: 'Fjalekalimi u ndryshua.' });
  } catch { res.status(500).json({ gabim: 'Gabim ne server.' }); }
}

module.exports = { login, meCurrent, ndryshoFjalekalimin, loginWithPin };
