require('dotenv').config();
const axios = require('axios');
const { ThermalPrinter, PrinterTypes, CharacterSet } = require('node-thermal-printer');
const fs = require('fs');
const path = require('path');

const API_URL = process.env.API_URL || 'https://kafe-nlagje-api-production-44dd.up.railway.app/api';
const PRINTER_IP = process.env.PRINTER_IP || '192.168.67.48';
const PRINTER_PORT = process.env.PRINTER_PORT || 9100;
const CHECK_INTERVAL = parseInt(process.env.CHECK_INTERVAL || '3') * 1000;
const BIZNESI = process.env.BIZNESI_EMRI || 'Kafe Nlagje';
const PRINTED_FILE = path.join(__dirname, 'printed.json');

let token = null;
let printedOrders = new Set();

function ngarkoPrintuarat() {
  try {
    if (fs.existsSync(PRINTED_FILE)) {
      const data = JSON.parse(fs.readFileSync(PRINTED_FILE, 'utf8'));
      printedOrders = new Set(data);
      console.log(`📋 Porosi te printuara me pare: ${printedOrders.size}`);
    }
  } catch { printedOrders = new Set(); }
}

function ruajPrintuarat() {
  try {
    fs.writeFileSync(PRINTED_FILE, JSON.stringify([...printedOrders]));
  } catch {}
}

async function kycu() {
  try {
    const { data } = await axios.post(`${API_URL}/auth/login`, {
      username: process.env.ADMIN_USERNAME || 'admin',
      password: process.env.ADMIN_PASSWORD || 'admin123'
    });
    token = data.token;
    console.log('✅ U kyça si:', data.user.emri);
    return true;
  } catch (err) {
    console.error('❌ Gabim kyçja:', err.message);
    return false;
  }
}

async function merrPorositëRe() {
  try {
    // Merr VETEM porositë e PERFUNDUARA që nuk i kemi printuar
    const { data } = await axios.get(`${API_URL}/orders?status=PERFUNDUAR&limit=50`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data.filter(p => !printedOrders.has(p.id));
  } catch (err) {
    if (err.response?.status === 401) await kycu();
    return [];
  }
}

async function printoFaturen(porosia) {
  const printer = new ThermalPrinter({
    type: PrinterTypes.EPSON,
    interface: `tcp://${PRINTER_IP}:${PRINTER_PORT}`,
    characterSet: CharacterSet.PC852_LATIN2,
    width: 48,
    options: { timeout: 5000 }
  });

  try {
    const isConnected = await printer.isPrinterConnected();
    if (!isConnected) {
      console.error(`❌ Printeri nuk është i lidhur në ${PRINTER_IP}:${PRINTER_PORT}`);
      return false;
    }

    // HEADER
    printer.alignCenter();
    printer.bold(true);
    printer.setTextSize(1, 1);
    printer.println(BIZNESI);
    printer.bold(false);
    printer.setTextNormal();
    printer.println('Powered by PRO IT | prs-ks.com');
    printer.drawLine();

    // INFO
    printer.alignLeft();
    printer.println(`Porosia: #${porosia.numriPorosise}`);
    printer.println(`Data: ${new Date(porosia.krijuarMe).toLocaleString('sq-AL')}`);
    printer.println(`Kamerieri: ${porosia.user?.emri || '—'}`);
    if (porosia.tavolinaNr) printer.println(`Tavolina: ${porosia.tavolinaNr}`);
    if (porosia.metodaPageses) printer.println(`Pagesa: ${porosia.metodaPageses === 'card' ? 'Kartë' : 'Cash'}`);
    printer.drawLine();

    // PRODUKTET
    printer.tableCustom([
      { text: 'Produkti', align: 'LEFT', width: 0.5 },
      { text: 'Sas', align: 'CENTER', width: 0.15 },
      { text: 'Cmimi', align: 'RIGHT', width: 0.35 }
    ]);
    printer.drawLine();

    for (const item of porosia.items || []) {
      printer.tableCustom([
        { text: String(item.emriProduktit || '—').substring(0, 22), align: 'LEFT', width: 0.5 },
        { text: String(Number(item.sasia)), align: 'CENTER', width: 0.15 },
        { text: `${Number(item.nentotali || 0).toFixed(2)}EUR`, align: 'RIGHT', width: 0.35 }
      ]);
    }

    printer.drawLine();

    // TOTALI
    printer.alignRight();
    printer.bold(true);
    printer.setTextSize(1, 1);
    printer.println(`TOTALI: ${Number(porosia.totali).toFixed(2)} EUR`);
    printer.bold(false);
    printer.setTextNormal();
    printer.newLine();

    // FOOTER
    printer.alignCenter();
    printer.println('Faleminderit per viziten!');
    printer.newLine();
    printer.cut();

    await printer.execute();
    console.log(`✅ U printua porosia #${porosia.numriPorosise} - Tav.${porosia.tavolinaNr || '?'}`);
    return true;

  } catch (err) {
    console.error(`❌ Gabim printim #${porosia.numriPorosise}:`, err.message);
    return false;
  }
}

async function loop() {
  const porosite = await merrPorositëRe();
  for (const porosia of porosite) {
    console.log(`📋 Porosi e re #${porosia.numriPorosise} - Tav.${porosia.tavolinaNr || '?'} - ${porosia.user?.emri}`);
    const sukses = await printoFaturen(porosia);
    if (sukses) {
      printedOrders.add(porosia.id);
      ruajPrintuarat();
    }
  }
}

async function nise() {
  console.log('');
  console.log('╔═══════════════════════════════════════╗');
  console.log('║   KAFE NLAGJE - Print Bridge          ║');
  console.log('║   Powered by PRO IT | prs-ks.com      ║');
  console.log('╚═══════════════════════════════════════╝');
  console.log('');
  console.log(`🌐 Backend: ${API_URL}`);
  console.log(`🖨️  Printer: ${PRINTER_IP}:${PRINTER_PORT}`);
  console.log(`⏱️  Kontroll çdo: ${CHECK_INTERVAL/1000} sekonda`);
  console.log('');

  ngarkoPrintuarat();

  const kyçur = await kycu();
  if (!kyçur) { console.error('❌ Nuk u kyça.'); process.exit(1); }

  console.log('✅ Print Bridge aktiv — duke pritur porosi...\n');
  await loop();
  setInterval(loop, CHECK_INTERVAL);
}

process.on('uncaughtException', err => console.error('❌:', err.message));
process.on('unhandledRejection', err => console.error('❌:', err));
nise();
