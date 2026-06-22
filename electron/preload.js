// ============================================================
// ELECTRON PRELOAD - Bridge midis main process dhe renderer
// ============================================================
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('kafeNlagjeApp', {
  versioni: '1.0.0',
  poweredBy: 'PRO IT',
  website: 'prs-ks.com',
});
