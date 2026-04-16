const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  startNavigation: () => ipcRenderer.send('start-navigation'),
  stopNavigation: () => ipcRenderer.send('stop-navigation'),
  onPythonStatus: (callback) => ipcRenderer.on('python-status', (_, status) => callback(status)),
  onGestureDetected: (callback) => ipcRenderer.on('gesture-detected', (_, gesture) => callback(gesture)),
  onPythonError: (callback) => ipcRenderer.on('python-error', (_, error) => callback(error)),
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
});
