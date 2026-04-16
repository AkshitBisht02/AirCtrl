const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let pythonProcess = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#030712',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    frame: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, '../frontend/public/icon.png'),
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../frontend/build/index.html'));
  }

  mainWindow.on('closed', () => {
    stopPython();
    mainWindow = null;
  });
}

function startPython() {
  if (pythonProcess) return;

  const backendPath = path.join(__dirname, '../backend/gesture_controller.py');
  const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';

  try {
    pythonProcess = spawn(pythonCmd, [backendPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    pythonProcess.stdout.on('data', (data) => {
      const msg = data.toString().trim();
      console.log('[Python]', msg);
      if (mainWindow) {
        if (msg.includes('STARTED')) {
          mainWindow.webContents.send('python-status', 'started');
        } else if (msg.includes('STOPPED')) {
          mainWindow.webContents.send('python-status', 'stopped');
          pythonProcess = null;
        } else if (msg.startsWith('GESTURE:')) {
          mainWindow.webContents.send('gesture-detected', msg.replace('GESTURE:', ''));
        } else if (msg.includes('ERROR')) {
          mainWindow.webContents.send('python-error', msg);
          pythonProcess = null;
        }
      }
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error('[Python stderr]', data.toString());
    });

    pythonProcess.on('close', (code) => {
      console.log('[Python] exited with code', code);
      pythonProcess = null;
      if (mainWindow) {
        mainWindow.webContents.send('python-status', 'stopped');
      }
    });

    pythonProcess.on('error', (err) => {
      console.error('[Python] spawn error:', err);
      pythonProcess = null;
      if (mainWindow) {
        mainWindow.webContents.send('python-error', err.message);
      }
    });

  } catch (err) {
    console.error('Failed to start Python:', err);
    if (mainWindow) {
      mainWindow.webContents.send('python-error', err.message);
    }
  }
}

function stopPython() {
  if (pythonProcess) {
    try {
      pythonProcess.stdin.write('STOP\n');
      setTimeout(() => {
        if (pythonProcess) {
          pythonProcess.kill();
          pythonProcess = null;
        }
      }, 2000);
    } catch (e) {
      pythonProcess.kill();
      pythonProcess = null;
    }
  }
}

ipcMain.on('start-navigation', () => {
  startPython();
});

ipcMain.on('stop-navigation', () => {
  stopPython();
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  stopPython();
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});
