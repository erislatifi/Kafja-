// ============================================================
// PRINTER CONTROLLER - Konfigurimi i printereve termik
// ============================================================
const prisma = require('../config/db');

// GET /api/printers
async function listoPrinteret(req, res) {
  try {
    const printeret = await prisma.printer.findMany({ orderBy: { emri: 'asc' } });
    res.json(printeret);
  } catch (err) {
    res.status(500).json({ gabim: 'Gabim ne server.' });
  }
}

// POST /api/printers
async function krijoPrinterin(req, res) {
  try {
    const { emri, lidhja, gjeresiaMM, ipAdresa, porti, pathUSB, parazgjedhur } = req.body;

    if (!emri) return res.status(400).json({ gabim: 'Emri i printerit eshte i detyrueshem.' });

    if (parazgjedhur) {
      await prisma.printer.updateMany({ data: { parazgjedhur: false } });
    }

    const printeri = await prisma.printer.create({
      data: {
        emri,
        lidhja: lidhja || 'USB',
        gjeresiaMM: gjeresiaMM || 80,
        ipAdresa: ipAdresa || null,
        porti: porti || 9100,
        pathUSB: pathUSB || null,
        parazgjedhur: !!parazgjedhur,
      },
    });

    res.status(201).json(printeri);
  } catch (err) {
    console.error('Gabim ne krijimin e printerit:', err);
    res.status(500).json({ gabim: 'Gabim ne server.' });
  }
}

// PUT /api/printers/:id
async function perditesoPrinterin(req, res) {
  try {
    const { emri, lidhja, gjeresiaMM, ipAdresa, porti, pathUSB, aktiv, parazgjedhur } = req.body;

    if (parazgjedhur) {
      await prisma.printer.updateMany({ data: { parazgjedhur: false } });
    }

    const printeri = await prisma.printer.update({
      where: { id: req.params.id },
      data: {
        ...(emri !== undefined && { emri }),
        ...(lidhja !== undefined && { lidhja }),
        ...(gjeresiaMM !== undefined && { gjeresiaMM }),
        ...(ipAdresa !== undefined && { ipAdresa }),
        ...(porti !== undefined && { porti }),
        ...(pathUSB !== undefined && { pathUSB }),
        ...(aktiv !== undefined && { aktiv }),
        ...(parazgjedhur !== undefined && { parazgjedhur }),
      },
    });

    res.json(printeri);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ gabim: 'Printeri nuk u gjet.' });
    res.status(500).json({ gabim: 'Gabim ne server.' });
  }
}

// DELETE /api/printers/:id
async function fshijPrinterin(req, res) {
  try {
    await prisma.printer.delete({ where: { id: req.params.id } });
    res.json({ mesazh: 'Printeri u fshi.' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ gabim: 'Printeri nuk u gjet.' });
    res.status(500).json({ gabim: 'Gabim ne server.' });
  }
}

// POST /api/printers/:id/test - dergon nje fature test
async function testoPrinterin(req, res) {
  try {
    const printerCfg = await prisma.printer.findUnique({ where: { id: req.params.id } });
    if (!printerCfg) return res.status(404).json({ gabim: 'Printeri nuk u gjet.' });

    const { ThermalPrinter, PrinterTypes, CharacterSet } = require('node-thermal-printer');

    const interfaceStr =
      printerCfg.lidhja === 'NETWORK'
        ? `tcp://${printerCfg.ipAdresa}:${printerCfg.porti || 9100}`
        : printerCfg.pathUSB || '/dev/usb/lp0';

    const printer = new ThermalPrinter({
      type: PrinterTypes.EPSON,
      interface: interfaceStr,
      characterSet: CharacterSet.PC852_LATIN2,
      width: printerCfg.gjeresiaMM === 58 ? 32 : 48,
      options: { timeout: 5000 },
    });

    const isConnected = await printer.isPrinterConnected().catch(() => false);
    if (!isConnected) {
      return res.status(400).json({ gabim: `Printeri nuk u gjet ne: ${interfaceStr}` });
    }

    printer.alignCenter();
    printer.bold(true);
    printer.println('TEST PRINTIMI');
    printer.bold(false);
    printer.println('Kafe Nlagje');
    printer.println('Powered by PRO IT');
    printer.drawLine();
    printer.println('Nese e shihni kete, printeri funksionon!');
    printer.cut();

    await printer.execute();

    res.json({ mesazh: 'Fatura test u dergua me sukses.' });
  } catch (err) {
    console.error('Gabim ne testimin e printerit:', err);
    res.status(500).json({ gabim: err.message || 'Gabim gjate testimit te printerit.' });
  }
}

module.exports = { listoPrinteret, krijoPrinterin, perditesoPrinterin, fshijPrinterin, testoPrinterin };
