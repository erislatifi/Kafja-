// ============================================================
// Instalo Print Bridge si shërbim Windows (fillon automatikisht)
// Ekzekuto: node install-service.js
// ============================================================
const Service = require('node-windows').Service;
const path = require('path');

const svc = new Service({
  name: 'KafeNlagjePrintBridge',
  description: 'Kafe Nlagje Print Bridge - PRO IT',
  script: path.join(__dirname, 'bridge.js'),
  nodeOptions: [],
  env: [{
    name: 'NODE_ENV',
    value: 'production'
  }]
});

svc.on('install', () => {
  svc.start();
  console.log('✅ Shërbimi u instalua dhe u nis!');
  console.log('   Emri: KafeNlagjePrintBridge');
  console.log('   Kontrollo: Services > KafeNlagjePrintBridge');
});

svc.on('error', (err) => {
  console.error('❌ Gabim instalimi:', err);
});

svc.install();
