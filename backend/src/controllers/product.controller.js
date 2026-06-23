// ============================================================
// PRODUCT CONTROLLER - Menaxhimi i produkteve
// ============================================================
const prisma = require('../config/db');

// GET /api/products?kategoria=&aktiv=&kerko=
async function listoProduktet(req, res) {
  try {
    const { kategoria, aktiv, kerko } = req.query;

    const filtra = {};
    if (kategoria) filtra.categoryId = kategoria;
    if (aktiv !== undefined) filtra.aktiv = aktiv === 'true';
    if (kerko) {
      filtra.OR = [
        { emri: { contains: kerko, mode: 'insensitive' } },
        { barkod: { contains: kerko, mode: 'insensitive' } },
      ];
    }

    const produktet = await prisma.product.findMany({
      where: filtra,
      include: { category: true },
      orderBy: { emri: 'asc' },
    });

    res.json(produktet);
  } catch (err) {
    console.error('Gabim ne listimin e produkteve:', err);
    res.status(500).json({ gabim: 'Gabim ne server.' });
  }
}

// GET /api/products/:id
async function merrProduktin(req, res) {
  try {
    const produkti = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { category: true },
    });
    if (!produkti) return res.status(404).json({ gabim: 'Produkti nuk u gjet.' });
    res.json(produkti);
  } catch (err) {
    res.status(500).json({ gabim: 'Gabim ne server.' });
  }
}

// POST /api/products
async function krijoProduktin(req, res) {
  try {
    const { emri, categoryId, cmimiShitjes, cmimiBlerjes, sasiaStok, njesia, alarmStokuMin, barkod } = req.body;

    if (!emri || !categoryId || cmimiShitjes === undefined) {
      return res.status(400).json({ gabim: 'Emri, kategoria dhe çmimi i shitjes jane te detyrueshem.' });
    }

    const produkti = await prisma.product.create({
      data: {
        emri,
        categoryId,
        cmimiShitjes,
        cmimiBlerjes: cmimiBlerjes || null,
        sasiaStok: sasiaStok || 0,
        njesia: njesia || 'COPE',
        alarmStokuMin: alarmStokuMin || 5,
        barkod: barkod || null,
      },
      include: { category: true },
    });

    // nese ka stok fillestar, regjistro si levizje HYRJE
    if (sasiaStok && Number(sasiaStok) > 0) {
      await prisma.stockMovement.create({
        data: {
          productId: produkti.id,
          lloji: 'HYRJE',
          sasia: sasiaStok,
          sasiaPara: 0,
          sasiaPas: sasiaStok,
          shenim: 'Stok fillestar gjate krijimit te produktit',
          userId: req.user.id,
        },
      });
    }

    res.status(201).json(produkti);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ gabim: 'Ky barkod ekziston tashme per nje produkt tjeter.' });
    }
    console.error('Gabim ne krijimin e produktit:', err);
    res.status(500).json({ gabim: 'Gabim ne server.' });
  }
}

// PUT /api/products/:id
async function perditesoProduktin(req, res) {
  try {
    const { emri, categoryId, cmimiShitjes, cmimiBlerjes, njesia, alarmStokuMin, barkod, aktiv } = req.body;

    const produkti = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        ...(emri !== undefined && { emri }),
        ...(categoryId !== undefined && { categoryId }),
        ...(cmimiShitjes !== undefined && { cmimiShitjes }),
        ...(cmimiBlerjes !== undefined && { cmimiBlerjes }),
        ...(njesia !== undefined && { njesia }),
        ...(alarmStokuMin !== undefined && { alarmStokuMin }),
        ...(barkod !== undefined && { barkod }),
        ...(aktiv !== undefined && { aktiv }),
      },
      include: { category: true },
    });

    res.json(produkti);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ gabim: 'Produkti nuk u gjet.' });
    if (err.code === 'P2002') return res.status(400).json({ gabim: 'Ky barkod ekziston tashme.' });
    console.error('Gabim ne perditesimin e produktit:', err);
    res.status(500).json({ gabim: 'Gabim ne server.' });
  }
}

// DELETE /api/products/:id (soft delete - vetem ckatviziohet)
async function fshijProduktin(req, res) {
  try {
    await prisma.product.update({
      where: { id: req.params.id },
      data: { aktiv: false },
    });
    res.json({ mesazh: 'Produkti u çaktivizua me sukses.' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ gabim: 'Produkti nuk u gjet.' });
    res.status(500).json({ gabim: 'Gabim ne server.' });
  }
}

// ---------------- KATEGORI ----------------

// GET /api/products/categories/all
async function listoKategorite(req, res) {
  try {
    const kategorite = await prisma.category.findMany({
      orderBy: { radhitja: 'asc' },
      include: { _count: { select: { produktet: true } } },
    });
    res.json(kategorite);
  } catch (err) {
    res.status(500).json({ gabim: 'Gabim ne server.' });
  }
}

// POST /api/products/categories
async function krijoKategorine(req, res) {
  try {
    const { emri, ikona, radhitja } = req.body;
    if (!emri) return res.status(400).json({ gabim: 'Emri i kategorise eshte i detyrueshem.' });

    const kategoria = await prisma.category.create({
      data: { emri, ikona: ikona || '📦', radhitja: radhitja || 0 },
    });
    res.status(201).json(kategoria);
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ gabim: 'Kjo kategori ekziston tashme.' });
    res.status(500).json({ gabim: 'Gabim ne server.' });
  }
}

module.exports = {
  listoProduktet,
  merrProduktin,
  krijoProduktin,
  perditesoProduktin,
  fshijProduktin,
  listoKategorite,
  krijoKategorine,
};
