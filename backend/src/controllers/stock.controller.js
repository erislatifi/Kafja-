// ============================================================
// STOCK CONTROLLER - Menaxhimi i stokut
// ============================================================
const prisma = require('../config/db');

// POST /api/stock/shto - shton sasi ne stok (HYRJE)
async function shtoStok(req, res) {
  try {
    const { productId, sasia, shenim } = req.body;

    if (!productId || !sasia || Number(sasia) <= 0) {
      return res.status(400).json({ gabim: 'Produkti dhe sasia (pozitive) jane te detyrueshme.' });
    }

    const produkti = await prisma.product.findUnique({ where: { id: productId } });
    if (!produkti) return res.status(404).json({ gabim: 'Produkti nuk u gjet.' });

    const sasiaPara = produkti.sasiaStok;
    const sasiaPas = Number(sasiaPara) + Number(sasia);

    const [produktiPerditesuar] = await prisma.$transaction([
      prisma.product.update({
        where: { id: productId },
        data: { sasiaStok: sasiaPas },
      }),
      prisma.stockMovement.create({
        data: {
          productId,
          lloji: 'HYRJE',
          sasia,
          sasiaPara,
          sasiaPas,
          shenim: shenim || 'Shtim stoku',
          userId: req.user.id,
        },
      }),
    ]);

    res.json({ mesazh: 'Stoku u shtua me sukses.', produkti: produktiPerditesuar });
  } catch (err) {
    console.error('Gabim ne shtimin e stokut:', err);
    res.status(500).json({ gabim: 'Gabim ne server.' });
  }
}

// POST /api/stock/korrigjo - korrigjim manual i stokut
async function korrigjoStok(req, res) {
  try {
    const { productId, sasiaERe, shenim } = req.body;

    if (!productId || sasiaERe === undefined || Number(sasiaERe) < 0) {
      return res.status(400).json({ gabim: 'Produkti dhe sasia e re jane te detyrueshme.' });
    }

    const produkti = await prisma.product.findUnique({ where: { id: productId } });
    if (!produkti) return res.status(404).json({ gabim: 'Produkti nuk u gjet.' });

    const sasiaPara = produkti.sasiaStok;
    const ndryshimi = Number(sasiaERe) - Number(sasiaPara);

    await prisma.$transaction([
      prisma.product.update({
        where: { id: productId },
        data: { sasiaStok: sasiaERe },
      }),
      prisma.stockMovement.create({
        data: {
          productId,
          lloji: 'KORRIGJIM',
          sasia: ndryshimi,
          sasiaPara,
          sasiaPas: sasiaERe,
          shenim: shenim || 'Korrigjim manual i stokut',
          userId: req.user.id,
        },
      }),
    ]);

    res.json({ mesazh: 'Stoku u korrigjua me sukses.' });
  } catch (err) {
    console.error('Gabim ne korrigjimin e stokut:', err);
    res.status(500).json({ gabim: 'Gabim ne server.' });
  }
}

// GET /api/stock/alarm - produktet nen nivelin e alarmit
async function produktetMeAlarm(req, res) {
  try {
    const produktet = await prisma.product.findMany({
      where: { aktiv: true },
      include: { category: true },
    });

    const meAlarm = produktet.filter((p) => Number(p.sasiaStok) <= Number(p.alarmStokuMin));

    res.json(meAlarm);
  } catch (err) {
    res.status(500).json({ gabim: 'Gabim ne server.' });
  }
}

// GET /api/stock/historia/:productId
async function historiaProduktit(req, res) {
  try {
    const { productId } = req.params;
    const { nga, deri } = req.query;

    const filtra = { productId };
    if (nga || deri) {
      filtra.krijuarMe = {};
      if (nga) filtra.krijuarMe.gte = new Date(nga);
      if (deri) filtra.krijuarMe.lte = new Date(deri);
    }

    const historia = await prisma.stockMovement.findMany({
      where: filtra,
      include: { user: { select: { emri: true } }, order: { select: { numriPorosise: true } } },
      orderBy: { krijuarMe: 'desc' },
      take: 200,
    });

    res.json(historia);
  } catch (err) {
    res.status(500).json({ gabim: 'Gabim ne server.' });
  }
}

// GET /api/stock/snapshot-ditor?data=YYYY-MM-DD
// Raporti: sa ka qene stoku ne fillim te dites vs sa ka mbetur tani
async function snapshotDitor(req, res) {
  try {
    const data = req.query.data ? new Date(req.query.data) : new Date();
    data.setHours(0, 0, 0, 0);

    const snapshots = await prisma.dailyStockSnapshot.findMany({
      where: { data },
      include: { },
    });

    // per cdo produkt aktiv, gjej snapshot-in ose krijo nje "live" duke krahasuar me stokun aktual
    const produktet = await prisma.product.findMany({ where: { aktiv: true } });

    const rezultati = produktet.map((p) => {
      const snap = snapshots.find((s) => s.productId === p.id);
      return {
        produktId: p.id,
        emri: p.emri,
        njesia: p.njesia,
        sasiaFillim: snap ? snap.sasiaFillim : null,
        sasiaTani: p.sasiaStok,
      };
    });

    res.json(rezultati);
  } catch (err) {
    console.error('Gabim ne snapshot ditor:', err);
    res.status(500).json({ gabim: 'Gabim ne server.' });
  }
}

// POST /api/stock/snapshot-ditor/krijo - krijon snapshot per fillim te dites (thirret automatikisht ose manualisht)
async function krijoSnapshotDitor(req, res) {
  try {
    const sot = new Date();
    sot.setHours(0, 0, 0, 0);

    const produktet = await prisma.product.findMany({ where: { aktiv: true } });

    let krijuar = 0;
    for (const p of produktet) {
      const ekziston = await prisma.dailyStockSnapshot.findUnique({
        where: { productId_data: { productId: p.id, data: sot } },
      });
      if (!ekziston) {
        await prisma.dailyStockSnapshot.create({
          data: { productId: p.id, data: sot, sasiaFillim: p.sasiaStok },
        });
        krijuar++;
      }
    }

    res.json({ mesazh: `Snapshot u krijua per ${krijuar} produkte.` });
  } catch (err) {
    console.error('Gabim ne krijimin e snapshot:', err);
    res.status(500).json({ gabim: 'Gabim ne server.' });
  }
}

module.exports = {
  shtoStok,
  korrigjoStok,
  produktetMeAlarm,
  historiaProduktit,
  snapshotDitor,
  krijoSnapshotDitor,
};
