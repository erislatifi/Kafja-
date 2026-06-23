// ============================================================
// PRINT SERVICE - Printimi ESC/POS per fature/porosi
// Mbeshtet printera 58mm dhe 80mm, USB ose Network
// ============================================================
const { ThermalPrinter, PrinterTypes, CharacterSet } = require('node-thermal-printer');
const prisma = require('../config/db');

function formatoCmim(vlera) {
  return Number(vlera).toFixed(2) + ' €';
}

function formatoData(date) {
  const d = new Date(date);
  const pjesetData = d.toLocaleDateString('sq-AL');
  const pjesetOra = d.toLocaleTimeString('sq-AL', { hour: '2-digit', minute: '2-digit' });
  return `${pjesetData} ${pjesetOra}`;
}

async function merrPrinterinAktiv() {
  const printer = await prisma.printer.findFirst({
    where: { parazgjedhur: true, aktiv: true },
  });
  if (!printer) {
    throw new Error('Nuk eshte konfiguruar asnje printer parazgjedhur. Shkoni te Cilesimet > Printer.');
  }
  return printer;
}

/**
 * Printon nje fature/porosi ne printerin termik te konfiguruar.
 * @param {object} porosia - Order me items dhe user te perfshira (include)
 */
async function printoFaturen(porosia) {
  const printerCfg = await merrPrinterinAktiv();

  const interface =
    printerCfg.lidhja === 'NETWORK'
      ? `tcp://${printerCfg.ipAdresa}:${printerCfg.porti || 9100}`
      : printerCfg.pathUSB || '/dev/usb/lp0';

  const printer = new ThermalPrinter({
    type: PrinterTypes.EPSON, // shumica e printerave ESC/POS jane kompatibel me EPSON command set
    interface,
    characterSet: CharacterSet.PC852_LATIN2, // mbeshtetje per karaktere shqipe (ë, ç)
    width: printerCfg.gjeresiaMM === 58 ? 32 : 48, // karaktere per rresht: 58mm≈32, 80mm≈48
    removeSpecialCharacters: false,
    options: { timeout: 5000 },
  });

  const isConnected = await printer.isPrinterConnected().catch(() => false);
  if (!isConnected) {
    throw new Error(`Printeri nuk eshte i lidhur ose i kapshem ne: ${interface}`);
  }

  // ---------------- HEADER ----------------
  printer.alignCenter();
  printer.setTypeFontB();
  printer.bold(true);
  printer.setTextSize(1, 1);
  printer.println(process.env.BIZNESI_EMRI || 'Kafe Nlagje');
  printer.bold(false);
  printer.setTextNormal();
  printer.println('Powered by PRO IT');
  printer.drawLine();

  // ---------------- INFO POROSIA ----------------
  printer.alignLeft();
  printer.println(`Porosia: #${porosia.numriPorosise}`);
  printer.println(`Data: ${formatoData(porosia.krijuarMe)}`);
  printer.println(`Perdoruesi: ${porosia.user?.emri || '—'}`);
  if (porosia.tavolinaNr) {
    printer.println(`Tavolina: ${porosia.tavolinaNr}`);
  }
  printer.drawLine();

  // ---------------- PRODUKTET ----------------
  printer.tableCustom([
    { text: 'Produkti', align: 'LEFT', width: 0.5 },
    { text: 'Sasia', align: 'CENTER', width: 0.2 },
    { text: 'Cmimi', align: 'RIGHT', width: 0.3 },
  ]);
  printer.drawLine();

  for (const item of porosia.items) {
    printer.tableCustom([
      { text: item.emriProduktit, align: 'LEFT', width: 0.5 },
      { text: String(item.sasia), align: 'CENTER', width: 0.2 },
      { text: formatoCmim(item.nentotali), align: 'RIGHT', width: 0.3 },
    ]);
  }

  printer.drawLine();

  // ---------------- TOTALI ----------------
  printer.alignRight();
  printer.bold(true);
  printer.setTextSize(1, 1);
  printer.println(`TOTALI: ${formatoCmim(porosia.totali)}`);
  printer.bold(false);
  printer.setTextNormal();

  printer.newLine();

  // ---------------- FOOTER ----------------
  printer.alignCenter();
  printer.drawLine();
  printer.println('Faleminderit per vizitën!');
  printer.println('prs-ks.com');
  printer.cut();

  await printer.execute();

  return { interface, numriPorosise: porosia.numriPorosise };
}

module.exports = { printoFaturen };
