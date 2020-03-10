const { BrowserWindow } = require('electron');
const path = require('path');
const log = require('electron-log');
const settings = require('electron-settings');
const { readFile } = require('fs');

function createWindow() {
  let windowState = settings.get('windowState')
  if (windowState == null) {
    windowState = {
      x: 250,
      y: 23,
      height: 1000,
      width: 1000
    }
  }
  let mainWindow = new BrowserWindow({
    title: 'Potion',
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  let url = settings.get('lasturl')
  if (url == null) {
    mainWindow.loadURL('https://notion.so/')
  } else {
    mainWindow.loadURL(url)
  }

  mainWindow.webContents.on('did-finish-load', function () {
    injectCSS(mainWindow)
  });

  mainWindow.webContents.on('new-window', function (event, url) {
    event.preventDefault()
    const { shell } = require('electron')
    shell.openExternal(url)
  });

  mainWindow.webContents.on('page-title-updated', function () {
    let url = mainWindow.webContents.getURL()
    console.log("Navigate to", url)
    settings.set('lasturl', url)
  })

  return mainWindow
}

function newTab(win) {
  tw = createWindow()
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
exports.createWindow = createWindow;