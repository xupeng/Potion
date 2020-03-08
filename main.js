const { app, Menu, BrowserWindow } = require('electron')
const path = require('path');
const { readFile } = require('fs');
const settings = require('electron-settings');

let mainWindow

function setupSystemMenu() {
  var isElectronMac = process.platform === "darwin";
  var fileMenu = {
    role: "fileMenu",
    submenu: isElectronMac
      ? [
        {
          label: "New Tab",
          accelerator: "CmdOrCtrl+T",
          click: function () { return newTab(); },
        },
        { role: "close" },
      ]
      : [
        {
          label: "New Tab",
          accelerator: "CmdOrCtrl+T",
          click: function () { return newTab(); },
        },
        { role: "quit" },
      ],
  };
  var editMenu = {
    role: "editMenu",
    submenu: isElectronMac
      ? [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectAll" },
        { type: "separator" },
        {
          label: "Speech",
          submenu: [{ role: "startSpeaking" }, { role: "stopSpeaking" }],
        },
      ]
      : [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { type: "separator" },
        { role: "selectAll" },
      ],
  };
  var viewMenu = {
    role: "viewMenu",
    submenu: [
      {
        label: "Reload",
        accelerator: "CmdOrCtrl+R",
        click: function () {
          var e_1, _a;
          var focusedWebContents = electron_1.webContents.getFocusedWebContents();
          if (focusedWebContents) {
            if (focusedWebContents.hostWebContents) {
              try {
                for (var _b = __values(electron_1.webContents.getAllWebContents()), _c = _b.next(); !_c.done; _c = _b.next()) {
                  var webContentsInstance = _c.value;
                  if (webContentsInstance.hostWebContents ===
                    focusedWebContents.hostWebContents) {
                    webContentsInstance.reload();
                  }
                }
              }
              catch (e_1_1) { e_1 = { error: e_1_1 }; }
              finally {
                try {
                  if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
              }
            }
            else {
              focusedWebContents.reload();
            }
          }
        },
      },
      {
        label: "Toggle Developer Tools",
        accelerator: isElectronMac ? "Alt+Command+I" : "Ctrl+Shift+I",
        click: function () {
          var focusedWebContents = electron_1.webContents.getFocusedWebContents();
          if (focusedWebContents) {
            var focusedWebContentsUrl = focusedWebContents.getURL();
            if (focusedWebContentsUrl.startsWith("file://") &&
              focusedWebContentsUrl.endsWith("/search.html")) {
              var notionWebviewWebContents = electron_1.webContents
                .getAllWebContents()
                .find(function (webContentsInstance) {
                  return webContentsInstance.hostWebContents ===
                    focusedWebContents.hostWebContents &&
                    webContentsInstance !== focusedWebContents;
                });
              if (notionWebviewWebContents) {
                focusedWebContents = notionWebviewWebContents;
              }
            }
            focusedWebContents.toggleDevTools();
          }
        },
      },
      {
        label: "Toggle Window Developer Tools",
        accelerator: isElectronMac ? "Shift+Alt+Command+I" : "Alt+Ctrl+Shift+I",
        visible: false,
        click: function (menuItem, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.webContents.toggleDevTools();
          }
        },
      },
      { type: "separator" },
      { role: "togglefullscreen" },
    ],
  };
  var windowMenu = {
    role: "windowMenu",
    submenu: isElectronMac
      ? [
        { role: "minimize" },
        { role: "zoom" },
        { type: "separator" },
        { role: "front" },
      ]
      : [
        { role: "minimize" },
        {
          label: "Maximize",
          click: function (item, focusedWindow) {
            if (focusedWindow) {
              if (focusedWindow.isMaximized()) {
                focusedWindow.unmaximize();
              }
              else {
                focusedWindow.maximize();
              }
            }
          },
        },
        { role: "close" },
      ],
  };
  var helpMenu = {
    role: "help",
    submenu: [
      {
        label: "Open Help && Support",
        click: function () {
          electron_1.shell.openExternal(config_1.default.baseURL + "/help");
        },
      },
    ],
  };
  var appMenu = {
    role: "appMenu",
    submenu: [
      { role: "about" },
      { type: "separator" },
      {
        label: "Reset App && Clear Local Data",
        click: function (item, focusedWindow) {
          return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
              switch (_a.label) {
                case 0: return [4, fs.remove(electron_1.app.getPath("userData"))];
                case 1:
                  _a.sent();
                  electron_1.app.relaunch();
                  electron_1.app.exit();
                  return [2];
              }
            });
          });
        },
      },
      { type: "separator" },
      { role: "services" },
      { type: "separator" },
      { role: "hide" },
      { role: "hideOthers" },
      { role: "unhide" },
      { type: "separator" },
      { role: "quit" },
    ],
  };
  var template = [
    fileMenu,
    editMenu,
    viewMenu,
    windowMenu,
    helpMenu,
  ];
  if (isElectronMac) {
    template.unshift(appMenu);
  }
  var menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function injectCSS(win) {
  css_file = path.join(__dirname, 'style.css')
  readFile(css_file, "utf-8", (err, data) => {
    win.webContents.insertCSS(data)
  })
}

function newTab() {
  tw = new BrowserWindow()
  tw.loadURL(mainWindow.webContents.getURL())
  mainWindow.addTabbedWindow(tw)
  tw.webContents.on('did-finish-load', function () {
    injectCSS(tw)
  })
}

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
  mainWindow = new BrowserWindow({
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

  setupSystemMenu()

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

app.name = 'Potion'
// app.setBadgeCount(10)

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

app.on('before-quit', function () {
  console.log('before quit')
  let win = BrowserWindow.getAllWindows()[0]
  settings.set('windowState', win.getBounds())
  console.log(win.getBounds())
})

