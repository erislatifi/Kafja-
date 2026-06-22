const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Duke filluar seed-imin...');

  // Admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      emri: 'Administratori',
      username: 'admin',
      password: adminPassword,
      role: 'ADMIN',
      aktiv: true,
    },
  });
  console.log('✅ Admin u krijua (admin / admin123)');

  // Kategorite
  const kategorite = [
    { emri: 'Kafe', ikona: '☕', radhitja: 1 },
    { emri: 'Pije te Gazuara', ikona: '🥤', radhitja: 2 },
    { emri: 'Uje', ikona: '💧', radhitja: 3 },
    { emri: 'Caj', ikona: '🍵', radhitja: 4 },
    { emri: 'Lengje', ikona: '🧃', radhitja: 5 },
    { emri: 'Alkool', ikona: '🍺', radhitja: 6 },
    { emri: 'Jo-Alkool', ikona: '🍹', radhitja: 7 },
    { emri: 'Ushqime te Vogla', ikona: '🥐', radhitja: 8 },
    { emri: 'Produkte Tjera', ikona: '📦', radhitja: 9 },
  ];

  for (const kat of kategorite) {
    await prisma.category.upsert({
      where: { emri: kat.emri },
      update: {},
      create: kat,
    });
  }
  console.log('✅ Kategorite u krijuan');

  // Printer
  const printer = await prisma.printer.findFirst({ where: { parazgjedhur: true } });
  if (!printer) {
    await prisma.printer.create({
      data: {
        emri: 'Printeri Kryesor (80mm)',
        lidhja: 'USB',
        gjeresiaMM: 80,
        pathUSB: '/dev/usb/lp0',
        aktiv: true,
        parazgjedhur: true,
      },
    });
    console.log('✅ Printeri u konfigurua');
  }

  console.log('🎉 Seed perfundoi!');
}

main()
  .catch((e) => {
    console.error('❌ Gabim:', e.message);
    process.exit(0); // exit 0 qe mos ta ndaloje serverin
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
