// ============================================================
// ORDER CONTROLLER - POS, krijim porosish, zbritje automatike stoku
// ============================================================
const prisma = require('../config/db');
const { printoFaturen } = require('../services/print.service');

// POST /api/orders - krijon nje porosi te re (kjo eshte funksioni kryesor i POS)
async function krijoPorosine(req, res) {
  try {
    const { items, tavolinaNr } = req.body; // items: [{ productId, sasia }]

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ gabim: 'Porosia duhet te kete te pakten nje produkt.' });
    }

    // 1. Verifiko produktet dhe stokun
    const productIds = items.map((it) => it.productId);
    const produktet = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const produktetMap = Object.fromEntries(produktet.map((p) => [p.id, p]));

    for (const item of items) {
      const p = produktetMap[item.productId];
      if (!p) {
        return res.status(400).json({ gabim: `Produkti me ID ${item.productId} nuk u gjet.` });
      }
      if (!p.aktiv) {
        return res.status(400).json({ gabim: `Produkti "${p.emri}" nuk eshte aktiv.` });
      }
      if (Number(p.sasiaStok) < Number(item.sasia)) {
        return res.status(400).json({
          gabim: `Stok i pamjaftueshem per "${p.emri}". Stoku aktual: ${p.sasiaStok} ${p.njesia}.`,
        });
      }
    }

    // 2. Llogarit totalin
    let totali = 0;
    const orderItemsData = items.map((item) => {
      const p = produktetMap[item.productId];
      const nentotali = Number(p.cmimiShitjes) * Number(item.sasia);
      totali += nentotali;
      return {
        productId: p.id,
        emriProduktit: p.emri,
        sasia: item.sasia,
        cmimiNjesi: p.cmimiShitjes,
        nentotali,
      };
    });

    // 3. Krijo porosine + zbrit stokun + regjistro levizjet, gjithcka ne nje transaksion
    const porosia = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: req.user.id,
          totali,
          tavolinaNr: tavolinaNr || null,
          status: 'PERFUNDUAR',
          items: { create: orderItemsData },
        },
        include: {
          items: true,
          user: { select: { emri: true, username: true } },
        },
      });

      // zbritje stoku + histori per cdo produkt
      for (const item of items) {
        const p = produktetMap[item.productId];
        const sasiaPara = p.sasiaStok;
        const sasiaPas = Number(sasiaPara) - Number(item.sasia);

        await tx.product.update({
          where: { id: p.id },
          data: { sasiaStok: sasiaPas },
        });

        await tx.stockMovement.create({
          data: {
            productId: p.id,
            lloji: 'SHITJE',
            sasia: -Number(item.sasia),
            sasiaPara,
            sasiaPas,
            shenim: `Shitje - Porosia #${order.numriPorosise}`,
            userId: req.user.id,
            orderId: order.id,
          },
        });
      }

      return order;
    });

    res.status(201).json(porosia);
  } catch (err) {
    console.error('Gabim ne krijimin e porosise:', err);
    res.status(500).json({ gabim: 'Gabim ne server gjate krijimit te porosise.' });
  }
}

// GET /api/orders?nga=&deri=&userId=&status=
async function listoPorosite(req, res) {
  try {
    const { nga, deri, userId, status } = req.query;

    const filtra = {};
    if (userId) filtra.userId = userId;
    if (status) filtra.status = status;
    if (nga || deri) {
      filtra.krijuarMe = {};
      if (nga) filtra.krijuarMe.gte = new Date(nga);
      if (deri) filtra.krijuarMe.lte = new Date(deri);
    }

    const porosite = await prisma.order.findMany({
      where: filtra,
      include: {
        items: true,
        user: { select: { emri: true, username: true } },
      },
      orderBy: { krijuarMe: 'desc' },
      take: 200,
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
        user: { select: { emri: true, username: true } },
      },
    });
    if (!porosia) return res.status(404).json({ gabim: 'Porosia nuk u gjet.' });
    res.json(porosia);
  } catch (err) {
    res.status(500).json({ gabim: 'Gabim ne server.' });
  }
}

// POST /api/orders/:id/printo - printon (ose ri-printon) faturen
async function printoPorosine(req, res) {
  try {
    const porosia = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: true, user: { select: { emri: true } } },
    });

    if (!porosia) return res.status(404).json({ gabim: 'Porosia nuk u gjet.' });

    const rezultati = await printoFaturen(porosia);

    await prisma.order.update({
      where: { id: porosia.id },
      data: {
        printuarMe: porosia.printuarMe || new Date(),
        numriPrintimeve: { increment: 1 },
      },
    });

    res.json({ mesazh: 'Fatura u dergua per printim.', detaje: rezultati });
  } catch (err) {
    console.error('Gabim ne printim:', err);
    res.status(500).json({ gabim: err.message || 'Gabim gjate printimit. Kontrolloni lidhjen me printerin.' });
  }
}

// POST /api/orders/:id/anulo
async function anuloPorosine(req, res) {
  try {
    const porosia = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: true },
    });
    if (!porosia) return res.status(404).json({ gabim: 'Porosia nuk u gjet.' });
    if (porosia.status === 'ANULUAR') {
      return res.status(400).json({ gabim: 'Porosia eshte tashme e anuluar.' });
    }

    // kthe stokun mbrapsht
    await prisma.$transaction(async (tx) => {
      for (const item of porosia.items) {
        const p = await tx.product.findUnique({ where: { id: item.productId } });
        const sasiaPara = p.sasiaStok;
        const sasiaPas = Number(sasiaPara) + Number(item.sasia);

        await tx.product.update({ where: { id: p.id }, data: { sasiaStok: sasiaPas } });
        await tx.stockMovement.create({
          data: {
            productId: p.id,
            lloji: 'KORRIGJIM',
            sasia: item.sasia,
            sasiaPara,
            sasiaPas,
            shenim: `Anulim i porosise #${porosia.numriPorosise}`,
            userId: req.user.id,
            orderId: porosia.id,
          },
        });
      }

      await tx.order.update({ where: { id: porosia.id }, data: { status: 'ANULUAR' } });
    });

    res.json({ mesazh: 'Porosia u anulua dhe stoku u kthye mbrapsht.' });
  } catch (err) {
    console.error('Gabim ne anulimin e porosise:', err);
    res.status(500).json({ gabim: 'Gabim ne server.' });
  }
}

module.exports = {
  krijoPorosine,
  listoPorosite,
  merrPorosine,
  printoPorosine,
  anuloPorosine,
};
