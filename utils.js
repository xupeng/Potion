const { BrowserWindow, BrowserView, app } = require('electron');
const path = require('path');
const log = require('electron-log');
const settings = require('electron-settings');
const { readFile } = require('fs');


function newWindow(url=null, windowBounds=null) {
  let win = new BrowserWindow({
    title: 'Potion',
    tabbingIdentifier: "Potion",
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  if (windowBounds) {
    win.setBounds(windowBounds)
  }

  if (!url) {
    url = 'https://notion.so/'
  }
  log.debug('New window with URL:', url)
  win.loadURL(url)

  win.webContents.on('did-finish-load', function () {
    injectCSS(win)
  });

  win.webContents.on('new-window', function (event, url) {
    event.preventDefault()
    const { shell } = require('electron')
    shell.openExternal(url)
  });

  win.on('will-resize', (event, bounds) => {
    windowBounds = bounds
  })

  win.on('resize', () => {
    log.debug('Window resized, save window bounds:', windowBounds)
    settings.set('windowBounds', windowBounds)
  })

  win.on('will-move', (event, bounds) => {
    windowBounds = bounds
  })

  win.on('move', () => {
    log.debug('Window moved, save window bounds:', windowBounds)
    settings.set('windowBounds', windowBounds)
  })

  return win
}

function newTab(url) {
  if (!url) {
    url = BrowserWindow.getFocusedWindow().webContents.getURL()
  }
  tw = newWindow(url)
  let windows = BrowserWindow.getAllWindows()
  let win = windows[windows.length - 1]
  win.addTabbedWindow(tw)
}

function injectCSS(win) {
  css_file = path.join(__dirname, 'style.css')
  readFile(css_file, "utf-8", (err, data) => {
    win.webContents.insertCSS(data)
  })
}

function loadWindowBounds() {
  return settings.get('windowBounds')
}

exports.newTab = newTab;
exports.injectCSS = injectCSS;
exports.newWindow = newWindow;
exports.loadWindowBounds = loadWindowBounds;