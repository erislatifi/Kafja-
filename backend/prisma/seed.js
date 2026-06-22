// ============================================================
// SEED - Te dhena fillestare per Kafe Nlagje
// Powered by PRO IT | prs-ks.com
// ============================================================
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Duke filluar seed-imin e databazes...');

  // ---------------- ADMIN USER ----------------
  const adminPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
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
  console.log('✅ Admin user u krijua:', admin.username, '(fjalekalimi: admin123)');

  // ---------------- KATEGORI ----------------
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
  console.log(`✅ U krijuan ${kategorite.length} kategori`);

  // ---------------- PRINTER PARAZGJEDHUR ----------------
  const printerEkzistues = await prisma.printer.findFirst({
    where: { parazgjedhur: true },
  });

  if (!printerEkzistues) {
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
    console.log('✅ Printeri parazgjedhur u konfigurua (80mm USB)');
  }

  // ---------------- PRODUKTE SHEMBULL (opsionale) ----------------
  const kafeKategoria = await prisma.category.findUnique({ where: { emri: 'Kafe' } });

  const produktetShembull = [
    { emri: 'Espresso', cmimiShitjes: 1.0, cmimiBlerjes: 0.3, sasiaStok: 100, njesia: 'COPE' },
    { emri: 'Kafe Macchiato', cmimiShitjes: 1.2, cmimiBlerjes: 0.35, sasiaStok: 100, njesia: 'COPE' },
    { emri: 'Cappuccino', cmimiShitjes: 1.5, cmimiBlerjes: 0.5, sasiaStok: 100, njesia: 'COPE' },
  ];

  for (const prod of produktetShembull) {
    const ekziston = await prisma.product.findFirst({ where: { emri: prod.emri } });
    if (!ekziston) {
      await prisma.product.create({
        data: { ...prod, categoryId: kafeKategoria.id },
      });
    }
  }
  console.log('✅ Produkte shembull u shtuan ne kategorine Kafe');

  console.log('🎉 Seed-imi perfundoi me sukses!');
}

main()
  .catch((e) => {
    console.error('❌ Gabim gjate seed-imit:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
