// ============================================================
// AUTH MIDDLEWARE - Verifikon JWT token
// ============================================================
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

async function autentikoUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ gabim: 'Mungon token-i i autentikimit. Ju lutem kyçuni perseri.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, emri: true, username: true, role: true, aktiv: true },
    });

    if (!user || !user.aktiv) {
      return res.status(401).json({ gabim: 'Perdoruesi nuk eshte aktiv ose nuk ekziston.' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ gabim: 'Sesioni ka skaduar. Ju lutem kyçuni perseri.' });
    }
    return res.status(401).json({ gabim: 'Token i pavlefshem.' });
  }
}

module.exports = { autentikoUser };
