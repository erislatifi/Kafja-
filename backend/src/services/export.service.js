// ============================================================
// EXPORT SERVICE - Eksport raportesh ne PDF dhe Excel
// ============================================================
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

/**
 * Krijon nje PDF me raportin ditor dhe e dergon ne response.
 */
function eksportoRaportinPDF(res, raporti) {
  const doc = new PDFDocument({ margin: 40 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=raporti-${raporti.data}.pdf`);

  doc.pipe(res);

  doc.fontSize(18).text('Kafe Nlagje - Raporti Ditor', { align: 'center' });
  doc.fontSize(10).text('Powered by PRO IT | prs-ks.com', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Data: ${raporti.data}`);
  doc.text(`Totali i Shitjes: ${raporti.totaliShitjes.toFixed(2)} €`);
  doc.text(`Numri i Porosive: ${raporti.numriPorosive}`);
  doc.text(`Fitimi Ditor: ${raporti.fitimiDitor.toFixed(2)} €`);
  doc.moveDown();

  doc.fontSize(14).text('Sipas Kategorise:', { underline: true });
  doc.moveDown(0.5);
  Object.entries(raporti.sipasKategorise).forEach(([kategoria, td]) => {
    doc.fontSize(11).text(`${kategoria}: ${td.sasia} njesi — ${td.totali.toFixed(2)} €`);
  });

  doc.moveDown();
  doc.fontSize(14).text('Produktet me te Shitura:', { underline: true });
  doc.moveDown(0.5);
  raporti.produktetMeShituara.forEach((p, i) => {
    doc.fontSize(11).text(`${i + 1}. ${p.emri} — ${p.sasia} njesi — ${p.totali.toFixed(2)} €`);
  });

  doc.moveDown(2);
  doc.fontSize(9).text('Powered by PRO IT | prs-ks.com', { align: 'center' });

  doc.end();
}

/**
 * Krijon nje Excel me raportin ditor dhe e dergon ne response.
 */
async function eksportoRaportinExcel(res, raporti) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Kafe Nlagje - PRO IT';

  const sheet = workbook.addWorksheet('Raporti Ditor');

  sheet.addRow(['Kafe Nlagje - Raporti Ditor']);
  sheet.addRow(['Powered by PRO IT | prs-ks.com']);
  sheet.addRow([]);
  sheet.addRow(['Data', raporti.data]);
  sheet.addRow(['Totali i Shitjes', `${raporti.totaliShitjes.toFixed(2)} €`]);
  sheet.addRow(['Numri i Porosive', raporti.numriPorosive]);
  sheet.addRow(['Fitimi Ditor', `${raporti.fitimiDitor.toFixed(2)} €`]);
  sheet.addRow([]);

  sheet.addRow(['Kategoria', 'Sasia', 'Totali (€)']);
  Object.entries(raporti.sipasKategorise).forEach(([kategoria, td]) => {
    sheet.addRow([kategoria, td.sasia, td.totali.toFixed(2)]);
  });

  sheet.addRow([]);
  sheet.addRow(['Produktet me te Shitura', 'Sasia', 'Totali (€)']);
  raporti.produktetMeShituara.forEach((p) => {
    sheet.addRow([p.emri, p.sasia, p.totali.toFixed(2)]);
  });

  sheet.getColumn(1).width = 30;
  sheet.getColumn(2).width = 15;
  sheet.getColumn(3).width = 15;
  sheet.getRow(1).font = { bold: true, size: 14 };

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=raporti-${raporti.data}.xlsx`);

  await workbook.xlsx.write(res);
  res.end();
}

module.exports = { eksportoRaportinPDF, eksportoRaportinExcel };
