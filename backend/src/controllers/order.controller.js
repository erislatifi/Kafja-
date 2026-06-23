const prisma = require('../config/db');
const { printoFaturen } = require('../services/print.service');

// GET /api/orders
async function listoPorosite(req, res) {
  try {
    const { status, tavolinaNr, limit } = req.query;
    const where = {};
    if (status) where.status = status;
    if (tavolinaNr) where.tavolinaNr = parseInt(tavolinaNr);

    const porosite = await prisma.order.findMany({
      where,
      include: {
        items: true,
        user: { select: { emri: true, username: true } }
      },
      orderBy: { krijuarMe: 'desc' },
      take: limit ? parseInt(limit) : 100
    });
    res.json(porosite);
  } catch (err) {
    res.status(500).json({ gabim: 'Gabim ne server.' });
  }
}

// GET /api/orders/:id
async function merrPorosine(req, res) {
  try {
    const porosia = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: true,
        user: { select: { emri: true } }
      }
    });
    if (!porosia) return res.status(404).json({ gabim: 'Porosia nuk u gjet.' });
    res.json(porosia);
  } catch (err) {
    res.status(500).json({ gabim: 'Gabim ne server.' });
  }
}

// POST /api/orders — krijon porosi AKTIVE te tavolina
async function krijoPorosine(req, res) {
  try {
    const { items, tavolinaNr } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ gabim: 'Porosia duhet te kete te pakten nje produkt.' });
    }

    // Merr produktet
    const produktetMap = {};
    for (const item of items) {
      const p = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!p || !p.aktiv) return res.status(400).json({ gabim: `Produkti nuk u gjet.` });
      if (Number(p.sasiaStok) < Number(item.sasia)) {
        return res.status(400).json({ gabim: `Stoku i pamjaftueshem per: ${p.emri}` });
      }
      produktetMap[item.productId] = p;
    }

    // Llogarit totalin
    let totali = 0;
    const orderItemsData = items.map(item => {
      const p = produktetMap[item.productId];
      const nentotali = Number(p.cmimiShitjes) * Number(item.sasia);
      totali += nentotali;
      return {
        productId: item.productId,
        emriProduktit: p.emri,
        sasia: Number(item.sasia),
        cmimiNjesi: Number(p.cmimiShitjes),
        nentotali
      };
    });

    // Krijo porosine si AKTIVE + zbrit stokun
    const porosia = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: req.user.id,
          totali,
          tavolinaNr: tavolinaNr || null,
          status: 'AKTIVE', // AKTIVE — tavolina mbetet e hapur
          items: { create: orderItemsData }
        },
        include: {
          items: true,
          user: { select: { emri: true } }
        }
      });

      // Zbrit stokun
      for (const item of items) {
        const p = produktetMap[item.productId];
        await tx.product.update({
          where: { id: p.id },
          data: { sasiaStok: Number(p.sasiaStok) - Number(item.sasia) }
        });
        await tx.stockMovement.create({
          data: {
            productId: p.id,
            userId: req.user.id,
            orderId: order.id,
            lloji: 'SHITJE',
            sasia: -Number(item.sasia),
            sasiaPara: Number(p.sasiaStok),
            sasiaPas: Number(p.sasiaStok) - Number(item.sasia),
            shenim: `Porosi #${order.numriPorosise} - Tav.${tavolinaNr || '?'}`
          }
        });
      }

      return order;
    });

    // Printo automatikisht
    try { await printoFaturen(porosia); } catch { }

    res.status(201).json(porosia);
  } catch (err) {
    console.error('Gabim krijoPorosine:', err);
    res.status(500).json({ gabim: 'Gabim ne server.' });
  }
}

// POST /api/orders/table/:tavolinaNr/mbyll — mbyll tavolinën me pagesë
async function mbyllTavolinen(req, res) {
  try {
    const { tavolinaNr } = req.params;
    const { metoda } = req.body; // cash | card

    // Merr të gjitha porositë aktive të tavolinës
    const porosite = await prisma.order.findMany({
      where: { tavolinaNr: parseInt(tavolinaNr), status: 'AKTIVE' },
      include: { items: true, user: { select: { emri: true } } }
    });

    if (porosite.length === 0) {
      return res.status(400).json({ gabim: 'Kjo tavolinë nuk ka porosi aktive.' });
    }

    const totaliTotal = porosite.reduce((s, p) => s + Number(p.totali), 0);
    const teGjithaItems = porosite.flatMap(p => p.items);

    // Mbyll të gjitha porositë e tavolinës
    await prisma.order.updateMany({
      where: { tavolinaNr: parseInt(tavolinaNr), status: 'AKTIVE' },
      data: {
        status: 'PERFUNDUAR',
        metodaPageses: metoda || 'cash'
      }
    });

    // Printo faturën finale
    const faturaFinale = {
      numriPorosise: porosite[0].numriPorosise,
      krijuarMe: new Date(),
      tavolinaNr: parseInt(tavolinaNr),
      totali: totaliTotal,
      user: { emri: req.user.emri || porosite[0].user?.emri },
      items: teGjithaItems,
      metodaPageses: metoda || 'cash'
    };

    try { await printoFaturen(faturaFinale); } catch { }

    res.json({
      mesazh: 'Tavolina u mbyll me sukses.',
      totali: totaliTotal,
      metoda: metoda || 'cash',
      tavolinaNr: parseInt(tavolinaNr)
    });
  } catch (err) {
    console.error('Gabim mbyllTavolinen:', err);
    res.status(500).json({ gabim: 'Gabim ne server.' });
  }
}

// GET /api/orders/table/:tavolinaNr — merr porositë aktive të tavolinës
async function porositeETabeolnes(req, res) {
  try {
    const porosite = await prisma.order.findMany({
      where: { tavolinaNr: parseInt(req.params.tavolinaNr), status: 'AKTIVE' },
      include: { items: true, user: { select: { emri: true } } },
      orderBy: { krijuarMe: 'asc' }
    });
    const totali = porosite.reduce((s, p) => s + Number(p.totali), 0);
    res.json({ porosite, totali, numriPorosive: porosite.length });
  } catch (err) {
    res.status(500).json({ gabim: 'Gabim ne server.' });
  }
}

// POST /api/orders/:id/printo
async function printoPorosine(req, res) {
  try {
    const porosia = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: true, user: { select: { emri: true } } }
    });
    if (!porosia) return res.status(404).json({ gabim: 'Porosia nuk u gjet.' });
    await printoFaturen(porosia);
    await prisma.order.update({
      where: { id: req.params.id },
      data: { printuarMe: new Date(), numriPrintimeve: { increment: 1 } }
    });
    res.json({ mesazh: 'Fatura u dërgua për printim.' });
  } catch (err) {
    res.status(500).json({ gabim: 'Gabim ne printim.' });
  }
}

// POST /api/orders/:id/anulo
async function anuloPorosine(req, res) {
  try {
    const porosia = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: true }
    });
    if (!porosia) return res.status(404).json({ gabim: 'Porosia nuk u gjet.' });

    // Kthe stokun
    for (const item of porosia.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { sasiaStok: { increment: Number(item.sasia) } }
      });
    }
    await prisma.order.update({
      where: { id: req.params.id },
      data: { status: 'ANULUAR' }
    });
    res.json({ mesazh: 'Porosia u anulua.' });
  } catch (err) {
    res.status(500).json({ gabim: 'Gabim ne server.' });
  }
}

module.exports = { listoPorosite, merrPorosine, krijoPorosine, mbyllTavolinen, porositeETabeolnes, printoPorosine, anuloPorosine };
