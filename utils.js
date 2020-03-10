const { BrowserWindow, BrowserView, app } = require('electron');
const path = require('path');
const log = require('electron-log');
const settings = require('electron-settings');
const { readFile } = require('fs');

const notion_url = /^https:\/\/(www.)?notion\.(so|com)/

let windowBounds = { x: 250, y: 23, width: 1000, height: 1000 }

function newWindow(withURL) {
  let _windowBounds = settings.get('windowBounds')
  if (_windowBounds) {
    windowBounds = _windowBounds
  }
  let win = new BrowserWindow({
    title: 'Potion',
    x: windowBounds.x,
    y: windowBounds.y,
    width: windowBounds.width,
    height: windowBounds.height,
    tabbingIdentifier: "Potion",
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  if (!withURL) {
    withURL = 'https://notion.so/'
  }
  log.debug('New window with URL:', withURL)
  win.loadURL(withURL)

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

function newTab(with_url) {
  if (!with_url) {
    with_url = BrowserWindow.getFocusedWindow().webContents.getURL()
  }
  tw = newWindow(with_url)
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

exports.newTab = newTab;
exports.injectCSS = injectCSS;
exports.newWindow = newWindow;