// ============================================================
// ELECTRON MAIN PROCESS - Kafe Nlagje Desktop App
// Powered by PRO IT | prs-ks.com
// ============================================================
const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

let mainWindow;

// VENDOSE adresen e aplikacionit tend web/online ketu
// Nese backend + frontend jane ne te njejten VPS, vendos URL-ne e plote te frontend-it
const APP_URL = process.env.KAFE_NLAGJE_URL || 'https://app.prs-ks.com';

function krijoDritaren() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    backgroundColor: '#0d0f0d',
    title: 'Kafe Nlagje - PRO IT',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Hiq menune e parazgjedhur (File/Edit/View...) per pamje me profesionale
  Menu.setApplicationMenu(null);

  mainWindow.loadURL(APP_URL);

  // Linket e jashtme hapen ne shfletues normal, jo brenda app
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  krijoDritaren();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) krijoDritaren();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
