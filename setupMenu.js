const { Menu, BrowserWindow } = require('electron');
const utils = require('./utils');

function setupSystemMenu() {
  var isElectronMac = process.platform === "darwin";
  var fileMenu = {
    role: "fileMenu",
    submenu: isElectronMac
      ? [
        {
          label: "New Tab",
          accelerator: "CmdOrCtrl+T",
          click: function (item, focusedWindow) {
            return utils.newTab();
          }
        },
        { role: "close" },
      ]
      : [
        {
          label: "New Tab",
          accelerator: "CmdOrCtrl+T",
          click: function (item, focusedWindow) {
            return utils.newTab();
          }
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
          BrowserWindow.getFocusedWindow().webContents.reload()
        },
      },
      {
        label: "Toggle Developer Tools",
        accelerator: isElectronMac ? "Alt+Command+I" : "Ctrl+Shift+I",
        click: function () {
          BrowserWindow.getFocusedWindow().webContents.toggleDevTools()
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
          electron_1.shell.openExternal("https://www.notion.so/help");
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

exports.setupSystemMenu = setupSystemMenu;