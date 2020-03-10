const { app, BrowserWindow } = require('electron');
const log = require('electron-log');
const settings = require('electron-settings');
const setupmenu = require('./setupMenu');
const utils = require('./utils');


if (!app.requestSingleInstanceLock()) {
  log.debug('There is already Potion running, quit...')
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    BrowserWindow.getAllWindows()[0].focus()
  })
}

app.on('ready', function () {
  app.name = 'Potion'

  log.debug('userData path:', app.getPath('userData'))
  log.debug('logs path:', app.getPath('logs'))

  utils.createWindow()
  setupmenu.setupSystemMenu()

  app.setAsDefaultProtocolClient('potion')
})

app.on('open-url', (event, url) => {
  let _url = url.replace(/^potion:\/\//gi, '')
  log.debug('Open URL via potion protocol:', url, '=>', _url)
  utils.newTab(_url)
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.on('before-quit', function () {
  windows = BrowserWindow.getAllWindows()
  let bounds = windows[0].getBounds()
  log.debug('Save window bounds:', bounds)
  settings.set('windowState', bounds)
})
