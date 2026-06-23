// ============================================================
// PRINT SERVICE
// Backend nuk printon direkt — Print Bridge lokal e bën këtë.
// Backend vetëm shënon porosinë si "e gatshme për printim".
// Print Bridge (node bridge.js) i merr dhe i dërgon te printer.
// ============================================================

async function printoFaturen(porosia) {
  // Nuk bëjmë asgjë këtu — Print Bridge e merr automatikisht
  // çdo porosi me status AKTIVE ose PERFUNDUAR
  console.log(`📋 Porosi #${porosia.numriPorosise} gati për printim nga Print Bridge`);
  return { mesazh: 'Print Bridge do ta printojë automatikisht.' };
}

module.exports = { printoFaturen };
