// ============================================================
// REPORT CONTROLLER - Raporte ditore, mujore, sipas perdoruesit/kategorise
// ============================================================
const prisma = require('../config/db');

function fillimDites(dateStr) {
  const d = dateStr ? new Date(dateStr) : new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function fundiDites(dateStr) {
  const d = dateStr ? new Date(dateStr) : new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

// GET /api/reports/ditor?data=YYYY-MM-DD
async function raportiDitor(req, res) {
  try {
    const nga = fillimDites(req.query.data);
    const deri = fundiDites(req.query.data);

    const porosite = await prisma.order.findMany({
      where: { krijuarMe: { gte: nga, lte: deri }, status: 'PERFUNDUAR' },
      include: { items: { include: { product: { include: { category: true } } } }, user: true },
    });

    const totaliShitjes = porosite.reduce((sum, o) => sum + Number(o.totali), 0);
    const numriPorosive = porosite.length;

    // grupim sipas kategorise
    const sipasKategorise = {};
    let fitimiDitor = 0;

    for (const porosia of porosite) {
      for (const item of porosia.items) {
        const katEmri = item.product?.category?.emri || 'Tjeter';
        if (!sipasKategorise[katEmri]) {
          sipasKategorise[katEmri] = { sasia: 0, totali: 0 };
        }
        sipasKategorise[katEmri].sasia += Number(item.sasia);
        sipasKategorise[katEmri].totali += Number(item.nentotali);

        if (item.product?.cmimiBlerjes) {
          fitimiDitor += (Number(item.cmimiNjesi) - Number(item.product.cmimiBlerjes)) * Number(item.sasia);
        }
      }
    }

    // produktet me te shitura
    const produktetMap = {};
    for (const porosia of porosite) {
      for (const item of porosia.items) {
        if (!produktetMap[item.productId]) {
          produktetMap[item.productId] = { emri: item.emriProduktit, sasia: 0, totali: 0 };
        }
        produktetMap[item.productId].sasia += Number(item.sasia);
        produktetMap[item.productId].totali += Number(item.nentotali);
      }
    }
    const produktetMeShituara = Object.values(produktetMap)
      .sort((a, b) => b.sasia - a.sasia)
      .slice(0, 10);

    res.json({
      data: nga.toISOString().split('T')[0],
      totaliShitjes,
      numriPorosive,
      fitimiDitor: Math.round(fitimiDitor * 100) / 100,
      sipasKategorise,
      produktetMeShituara,
    });
  } catch (err) {
    console.error('Gabim ne raportin ditor:', err);
    res.status(500).json({ gabim: 'Gabim ne server.' });
  }
}

// GET /api/reports/mujor?viti=&muaji=
async function raportiMujor(req, res) {
  try {
    const viti = parseInt(req.query.viti) || new Date().getFullYear();
    const muaji = parseInt(req.query.muaji) || new Date().getMonth() + 1;

    const nga = new Date(viti, muaji - 1, 1, 0, 0, 0);
    const deri = new Date(viti, muaji, 0, 23, 59, 59);

    const porosite = await prisma.order.findMany({
      where: { krijuarMe: { gte: nga, lte: deri }, status: 'PERFUNDUAR' },
      include: { items: true },
    });

    const totaliShitjes = porosite.reduce((sum, o) => sum + Number(o.totali), 0);
    const numriPorosive = porosite.length;

    // grupim sipas dites per grafik
    const sipasDites = {};
    for (const porosia of porosite) {
      const dita = porosia.krijuarMe.toISOString().split('T')[0];
      if (!sipasDites[dita]) sipasDites[dita] = 0;
      sipasDites[dita] += Number(porosia.totali);
    }

    res.json({
      viti,
      muaji,
      totaliShitjes,
      numriPorosive,
      mesatarjaDitore: numriPorosive > 0 ? Math.round((totaliShitjes / Object.keys(sipasDites).length) * 100) / 100 : 0,
      sipasDites,
    });
  } catch (err) {
    console.error('Gabim ne raportin mujor:', err);
    res.status(500).json({ gabim: 'Gabim ne server.' });
  }
}

// GET /api/reports/sipas-perdoruesit?nga=&deri=
async function raportiSipasPerdoruesit(req, res) {
  try {
    const nga = req.query.nga ? fillimDites(req.query.nga) : fillimDites();
    const deri = req.query.deri ? fundiDites(req.query.deri) : fundiDites();

    const porosite = await prisma.order.findMany({
      where: { krijuarMe: { gte: nga, lte: deri }, status: 'PERFUNDUAR' },
      include: { user: true },
    });

    const sipasUserit = {};
    for (const p of porosite) {
      const key = p.user.emri;
      if (!sipasUserit[key]) sipasUserit[key] = { numriPorosive: 0, totali: 0 };
      sipasUserit[key].numriPorosive++;
      sipasUserit[key].totali += Number(p.totali);
    }

    res.json(sipasUserit);
  } catch (err) {
    res.status(500).json({ gabim: 'Gabim ne server.' });
  }
}

// GET /api/reports/dashboard - permbledhje per dashboard kryesor
async function dashboardData(req, res) {
  try {
    const nga = fillimDites();
    const deri = fundiDites();

    const porositeSot = await prisma.order.findMany({
      where: { krijuarMe: { gte: nga, lte: deri }, status: 'PERFUNDUAR' },
      include: { items: true },
    });

    const totaliSot = porositeSot.reduce((sum, o) => sum + Number(o.totali), 0);

    const produktetAlarm = await prisma.product.findMany({ where: { aktiv: true } });
    const stokUlet = produktetAlarm.filter((p) => Number(p.sasiaStok) <= Number(p.alarmStokuMin));

    // shitjet 7 dite te fundit per grafik
    const shtatDiteMeParpara = new Date();
    shtatDiteMeParpara.setDate(shtatDiteMeParpara.getDate() - 6);
    shtatDiteMeParpara.setHours(0, 0, 0, 0);

    const porosite7Dite = await prisma.order.findMany({
      where: { krijuarMe: { gte: shtatDiteMeParpara }, status: 'PERFUNDUAR' },
    });

    const grafiku7Dite = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(shtatDiteMeParpara);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split('T')[0];
      grafiku7Dite[key] = 0;
    }
    for (const p of porosite7Dite) {
      const key = p.krijuarMe.toISOString().split('T')[0];
      if (grafiku7Dite[key] !== undefined) grafiku7Dite[key] += Number(p.totali);
    }

    // produktet me te shitura sot
    const produktetMap = {};
    for (const porosia of porositeSot) {
      for (const item of porosia.items) {
        if (!produktetMap[item.productId]) {
          produktetMap[item.productId] = { emri: item.emriProduktit, sasia: 0 };
        }
        produktetMap[item.productId].sasia += Number(item.sasia);
      }
    }
    const produktetMeShituaraSot = Object.values(produktetMap)
      .sort((a, b) => b.sasia - a.sasia)
      .slice(0, 5);

    res.json({
      totaliSot,
      numriPorosiveSot: porositeSot.length,
      produktetMeShituaraSot,
      stokUlet,
      grafiku7Dite,
    });
  } catch (err) {
    console.error('Gabim ne dashboard:', err);
    res.status(500).json({ gabim: 'Gabim ne server.' });
  }
}

module.exports = { raportiKamarjerit,
  raportiDitor,
  raportiMujor,
  raportiSipasPerdoruesit,
  dashboardData,
};

// GET /api/reports/kamerier?data=2026-06-22&userId=xxx
async function raportiKamarjerit(req, res) {
  try {
    const { data, userId } = req.query;
    const fillimi = new Date(data + 'T00:00:00.000Z');
    const fundi = new Date(data + 'T23:59:59.999Z');
    const uid = userId || req.user.id;

    const porosite = await prisma.order.findMany({
      where: {
        userId: uid,
        krijuarMe: { gte: fillimi, lte: fundi },
        status: 'PERFUNDUAR'
      },
      include: {
        items: true,
        user: { select: { emri: true } }
      },
      orderBy: { krijuarMe: 'asc' }
    });

    const totali = porosite.reduce((s, p) => s + Number(p.totali), 0);
    
    // Sipas kategorisë
    const sipasKategorise = {};
    for (const p of porosite) {
      for (const it of p.items) {
        const kat = it.kategoria || 'Tjera';
        if (!sipasKategorise[kat]) sipasKategorise[kat] = { sasia: 0, totali: 0 };
        sipasKategorise[kat].sasia += Number(it.sasia);
        sipasKategorise[kat].totali += Number(it.nentotali);
      }
    }

    res.json({
      totali,
      numriPorosive: porosite.length,
      sipasKategorise,
      porosite
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ gabim: 'Gabim ne raport.' });
  }
}
