const { app, webContents, BrowserWindow } = require('electron');
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
  app.allowRendererProcessReuse = false

  let windowBounds = utils.loadWindowBounds()
  let lastUrls = settings.get('lastUrls')
  if (!lastUrls) {
    utils.newWindow(null, windowBounds)
  } else {
    utils.newWindow(lastUrls[0], windowBounds)
    for (i = 1; i < lastUrls.length; i++) {
      utils.newTab(lastUrls[i])
    }
  }

  setupmenu.setupSystemMenu()

  app.setAsDefaultProtocolClient('potion')
  app.setAsDefaultProtocolClient('notion')
})

app.on('open-url', (event, url) => {
  let _url = null
  if (url.startsWith('potion://')) {
    _url = url.replace(/^potion:\/\//gi, '')
  } else if (url.startsWith('notion:')) {
    _url = 'https://notion.so' + url.replace(/^notion:/gi, '')
  }
  if (_url) {
    log.debug('Open URL via potion protocol:', url, '=>', _url)
    utils.newTab(_url)
  } else {
    log.debug('Unkonwn URL from potion protocol:', url)
  }
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.on('before-quit', function () {
  wcs = webContents.getAllWebContents()
  let lastUrls = []
  for (i = 0; i < wcs.length; i++) {
    let _url = wcs[i].getURL()
    lastUrls.unshift(_url)
  }
  settings.set('lastUrls', lastUrls)
})