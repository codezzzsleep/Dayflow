const { app, BrowserWindow, nativeTheme } = require('electron');
const path = require('path');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    title: 'Dayflow',
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#0b0b0f' : '#f5f6fb',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  if (!app.isPackaged) {
    win.webContents.openDevTools({ mode: 'detach' });
  }
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
