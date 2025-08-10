import { app, BrowserWindow } from 'electron';
import path from 'path';
import serve from 'electron-serve';
import chokidar from 'chokidar';
import { fileURLToPath } from 'url';

const port = process.env.PORT || 5173;
const dev = !app.isPackaged;
const loadURL = serve({ directory: './build' });
let mainWindow;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'Registration',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (dev) {
    mainWindow.loadURL(`http://localhost:${port}`);
  } else {
    mainWindow.loadURL('app://-/');
  }
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

if (dev) {
  const watcher = chokidar.watch(['./src/backend', './main.js'], {
    ignored: /node_modules/,
    persistent: true,
  });

  watcher.on('change', () => {
    app.relaunch();
    app.exit();
  });
}
