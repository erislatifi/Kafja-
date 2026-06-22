// ============================================================
// ROLE MIDDLEWARE - Kontrollon lejet sipas rolit te perdoruesit
// ============================================================
// Perdorim: lejoVetem('ADMIN', 'MENAXHER')

function lejoVetem(...rolet) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ gabim: 'Duhet te kyçeni fillimisht.' });
    }

    if (!rolet.includes(req.user.role)) {
      return res.status(403).json({
        gabim: `Nuk keni leje per kete veprim. Rolet e lejuara: ${rolet.join(', ')}`,
      });
    }

    next();
  };
}

module.exports = { lejoVetem };
