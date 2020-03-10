const { BrowserWindow, BrowserView, app } = require('electron');
const path = require('path');
const log = require('electron-log');
const settings = require('electron-settings');
const { readFile } = require('fs');

const notion_url = /^https:\/\/(www.)?notion\.(so|com)/

function createWindow(with_url) {
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
    tabbingIdentifier: "Potion",
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  if (!with_url) {
    with_url = 'https://notion.so/'
  }
  mainWindow.loadURL(with_url)

  mainWindow.webContents.on('did-finish-load', function () {
    injectCSS(mainWindow)
  });

  mainWindow.webContents.on('new-window', function (event, url) {
    event.preventDefault()
    const { shell } = require('electron')
    shell.openExternal(url)
  });

  return mainWindow
}

function newTab(with_url) {
  let windows = BrowserWindow.getAllWindows()
  let win = windows[windows.length - 1]
  if(!with_url) {
    with_url = BrowserWindow.getFocusedWindow().webContents.getURL()
  }
  tw = createWindow(with_url)
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