const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Duke filluar seed-imin...');

  const adminPassword = await bcrypt.hash('admin123', 10);

  // Admin - PIN 1234
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: { pin: '1234' },
    create: { emri: 'Admin Nlagje', username: 'admin', password: adminPassword, role: 'ADMIN', pin: '1234', aktiv: true },
  });

  // Kamerier - PIN 5678
  const kam1Pass = await bcrypt.hash('kam123', 10);
  await prisma.user.upsert({
    where: { username: 'agim' },
    update: { pin: '5678' },
    create: { emri: 'Agim Krasniqi', username: 'agim', password: kam1Pass, role: 'KAMERIER', pin: '5678', aktiv: true },
  });

  // Arkatar - PIN 9012
  const arkPass = await bcrypt.hash('ark123', 10);
  await prisma.user.upsert({
    where: { username: 'blerta' },
    update: { pin: '9012' },
    create: { emri: 'Blerta Morina', username: 'blerta', password: arkPass, role: 'ARKATAR', pin: '9012', aktiv: true },
  });

  console.log('✅ Perdoruesit u krijuan:');
  console.log('   Admin Nlagje  → PIN: 1234');
  console.log('   Agim Krasniqi → PIN: 5678');
  console.log('   Blerta Morina → PIN: 9012');

  // Kategorite
  const kats = [
    { emri: 'Kafe', ikona: '☕', radhitja: 1 },
    { emri: 'Pije te Gazuara', ikona: '🥤', radhitja: 2 },
    { emri: 'Uje', ikona: '💧', radhitja: 3 },
    { emri: 'Caj', ikona: '🍵', radhitja: 4 },
    { emri: 'Lengje', ikona: '🧃', radhitja: 5 },
    { emri: 'Alkool', ikona: '🍺', radhitja: 6 },
    { emri: 'Ushqime te Vogla', ikona: '🥐', radhitja: 7 },
    { emri: 'Produkte Tjera', ikona: '📦', radhitja: 8 },
  ];
  for (const k of kats) {
    await prisma.category.upsert({ where: { emri: k.emri }, update: {}, create: k });
  }
  console.log('✅ Kategorite u krijuan');

  // Printer
  const printer = await prisma.printer.findFirst({ where: { parazgjedhur: true } });
  if (!printer) {
    await prisma.printer.create({
      data: { emri: 'Printeri Kryesor 80mm', lidhja: 'USB', gjeresiaMM: 80, pathUSB: '/dev/usb/lp0', aktiv: true, parazgjedhur: true }
    });
    console.log('✅ Printeri u konfigurua');
  }

  console.log('🎉 Seed perfundoi!');
}

main().catch(e => { console.error('❌ Gabim seed:', e.message); process.exit(0); }).finally(() => prisma.$disconnect());
