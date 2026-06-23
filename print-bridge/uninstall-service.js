const Service = require('node-windows').Service;
const path = require('path');

const svc = new Service({
  name: 'KafeNlagjePrintBridge',
  script: path.join(__dirname, 'bridge.js')
});

svc.on('uninstall', () => console.log('✅ Shërbimi u çinstalua.'));
svc.uninstall();
