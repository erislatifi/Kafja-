// ============================================================
// KAFE NLAGJE - Print Bridge
// Lidh backend-in online me printerin termik lokal (LAN/USB)
// Powered by PRO IT | prs-ks.com
// ============================================================
require('dotenv').config();
const axios = require('axios');
const { ThermalPrinter, PrinterTypes, CharacterSet } = require('node-thermal-printer');

const API_URL = process.env.API_URL || 'https://kafe-nlagje-api-production-44dd.up.railway.app/api';
const PRINTER_IP = process.env.PRINTER_IP || '192.168.1.100';
const PRINTER_PORT = process.env.PRINTER_PORT || 9100;
const CHECK_INTERVAL = parseInt(process.env.CHECK_INTERVAL || '3') * 1000;
const BIZNESI = process.env.BIZNESI_EMRI || 'Kafe Nlagje';

let token = null;
let lastPrintedOrderId = null;
let printedOrders = new Set(); // mban mend cilat porosi i kemi printuar

// ── KYÇJA ──
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

// ── MERR POROSITË E PAPRINTUARA ──
async function merrPorositëRe() {
  try {
    const { data } = await axios.get(`${API_URL}/orders?status=PERFUNDUAR`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    // Filtro porositë që nuk i kemi printuar ende
    return data.filter(p => !printedOrders.has(p.id) && !p.printuarMe);
  } catch (err) {
    if (err.response?.status === 401) {
      console.log('🔄 Token skadoi, po rikyçem...');
      await kycu();
    }
    return [];
  }
}

// ── PRINTO FATURËN ──
async function printoFaturen(porosia) {
  const printer = new ThermalPrinter({
    type: PrinterTypes.EPSON,
    interface: `tcp://${PRINTER_IP}:${PRINTER_PORT}`,
    characterSet: CharacterSet.PC852_LATIN2,
    width: 48, // 80mm = 48 karaktere
    options: { timeout: 5000 }
  });

  try {
    const isConnected = await printer.isPrinterConnected();
    if (!isConnected) {
      console.error(`❌ Printeri nuk është i lidhur në ${PRINTER_IP}:${PRINTER_PORT}`);
      return false;
    }

    // ── HEADER ──
    printer.alignCenter();
    printer.bold(true);
    printer.setTextSize(1, 1);
    printer.println(BIZNESI);
    printer.bold(false);
    printer.setTextNormal();
    printer.println('Powered by PRO IT');
    printer.drawLine();

    // ── INFO ──
    printer.alignLeft();
    printer.println(`Porosia: #${porosia.numriPorosise}`);
    printer.println(`Data: ${new Date(porosia.krijuarMe).toLocaleString('sq-AL')}`);
    printer.println(`Kamerieri: ${porosia.user?.emri || '—'}`);
    if (porosia.tavolinaNr) printer.println(`Tavolina: ${porosia.tavolinaNr}`);
    printer.drawLine();

    // ── PRODUKTET ──
    printer.tableCustom([
      { text: 'Produkti', align: 'LEFT', width: 0.5 },
      { text: 'Sas.', align: 'CENTER', width: 0.15 },
      { text: 'Cmimi', align: 'RIGHT', width: 0.35 }
    ]);
    printer.drawLine();

    for (const item of porosia.items || []) {
      printer.tableCustom([
        { text: item.emriProduktit || item.emri, align: 'LEFT', width: 0.5 },
        { text: String(item.sasia), align: 'CENTER', width: 0.15 },
        { text: `${Number(item.nentotali || item.cmimi * item.sasia).toFixed(2)} EUR`, align: 'RIGHT', width: 0.35 }
      ]);
    }

    printer.drawLine();

    // ── TOTALI ──
    printer.alignRight();
    printer.bold(true);
    printer.setTextSize(1, 1);
    printer.println(`TOTALI: ${Number(porosia.totali).toFixed(2)} EUR`);
    printer.bold(false);
    printer.setTextNormal();
    printer.newLine();

    // ── FOOTER ──
    printer.alignCenter();
    printer.println('Faleminderit per viziten!');
    printer.println('prs-ks.com');
    printer.cut();

    await printer.execute();
    console.log(`🖨️ U printua porosia #${porosia.numriPorosise}`);
    return true;

  } catch (err) {
    console.error(`❌ Gabim printim #${porosia.numriPorosise}:`, err.message);
    return false;
  }
}

// ── SHËNO SI E PRINTUAR ──
async function shënoSiPrintuar(orderId) {
  try {
    await axios.post(`${API_URL}/orders/${orderId}/printo`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    printedOrders.add(orderId);
  } catch { 
    printedOrders.add(orderId); // shëno lokalisht edhe nëse API dështon
  }
}

// ── LOOP KRYESOR ──
async function loop() {
  const porosite = await merrPorositëRe();
  
  for (const porosia of porosite) {
    console.log(`📋 Porosi e re #${porosia.numriPorosise} — ${porosia.user?.emri}`);
    const sukses = await printoFaturen(porosia);
    if (sukses) {
      await shënoSiPrintuar(porosia.id);
    }
  }
}

// ── NISJA ──
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

  const kyçur = await kycu();
  if (!kyçur) {
    console.error('❌ Nuk u kyça. Kontrolloni .env dhe provoni sërish.');
    process.exit(1);
  }

  console.log('✅ Print Bridge aktiv — duke pritur porosi...\n');
  
  // Kontroll i parë menjëherë
  await loop();
  
  // Kontroll çdo N sekonda
  setInterval(loop, CHECK_INTERVAL);
}

// Trajtim i gabimeve të papritura
process.on('uncaughtException', err => console.error('❌ Gabim:', err.message));
process.on('unhandledRejection', err => console.error('❌ Promise:', err));

nise();
