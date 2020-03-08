const { app, BrowserWindow } = require('electron')
const path = require('path');
const { readFile } = require('fs');
const settings = require('electron-settings');

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
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    title: 'Potion',
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  // mainWindow.loadFile('index.html')
  let url = settings.get('lasturl')
  if (url == null) {
    mainWindow.loadURL('https://notion.so/xupeng')
  } else {
    mainWindow.loadURL(url)
  }

  mainWindow.webContents.on('did-finish-load', function () {
    css_file = path.join(__dirname, 'style.css')
    readFile(css_file, "utf-8", (err, data) => {
      mainWindow.webContents.insertCSS(data)
    })
  });

  let wc = mainWindow.webContents

  wc.on('page-title-updated', function(){
    console.log(wc.getURL())
    settings.set('lasturl', wc.getURL())
  })

  // tw = new BrowserWindow()
  // tw.loadURL('https://www.douban.com/')
  // mainWindow.addTabbedWindow(tw)

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

app.name = 'Potion'
// app.setBadgeCount(10)

/* app.setJumpList([
  {
    type: 'custom',
    name: 'RRR',
    items: [
      {
        type: 'file',
        path: '/etc/passwd'
      }
    ]
  }
]) */

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  let win = BrowserWindow.getAllWindows()[0]
  settings.set('height', 1000)
  console.log('saved')
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

app.on('web-contents-created', (event, webContents) => {
  // console.log('wwwwww')
})

app.on('before-quit', function(){
  console.log('before quit')
  let win = BrowserWindow.getAllWindows()[0]
  settings.set('windowState', win.getBounds())
  console.log(win.getBounds())
})