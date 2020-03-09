const { app, BrowserWindow } = require('electron');
const settings = require('electron-settings');
const setupmenu = require('./setupMenu');
const utils = require('./utils');

app.name = 'Potion'

app.on('ready', function () {
  utils.createWindow()
  setupmenu.setupSystemMenu()
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.on('before-quit', function () {
  let win = BrowserWindow.getFocusedWindow()
  let bounds = win.getBounds()
  console.log('Save window bounds:', bounds)
  settings.set('windowState', bounds)
})