const { app, BrowserWindow } = require('electron');
const log = require('electron-log');
const settings = require('electron-settings');
const setupmenu = require('./setupMenu');
const utils = require('./utils');

app.name = 'Potion'

app.on('ready', function () {
  log.debug('userData path:', app.getPath('userData'))
  log.debug('logs path:', app.getPath('logs'))
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