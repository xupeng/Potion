const { shell, Menu, BrowserWindow, dialog } = require('electron');
const utils = require('./utils');
const log = require('electron-log');
const fs = require('fs');

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
                {
                    label: "Print to PDF",
                    accelerator: "Ctrl+Shift+P",
                    click: function (item, focusedWindow) {
                        let title = focusedWindow.webContents.getTitle()
                        let filePath = dialog.showSaveDialogSync(focusedWindow, { defaultPath: `${title}.pdf` })
                        let options = {
                            'marginsType': 0,
                            'pageSize': 'A4',
                            'printBackground': false,
                            'landscape': false
                        }
                        focusedWindow.webContents.printToPDF(options).then(data => {
                            fs.writeFile(filePath, data, (error) => {
                                if (error) throw error
                                log.debug(`Write PDF to ${filePath} successfully.`)
                            })
                        }).catch(error => {
                            log.debug(error)
                        })
                    }
                },
                {
                    label: "Reload CSS",
                    click: function (item, focusedWindow) {
                        utils.reloadCSS()
                    }
                },

                {
                    label: "Print",
                    click: function (item, focusedWindow) {
                        focusedWindow.webContents.print()
                    }
                },
            ]
            : [
                {
                    label: "New Window",
                    accelerator: "Ctrl+Shift+N",
                    click: function (item, focusedWindow) {
                        return utils.newWindow();
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
                { role: "pasteAndMatchStyle" },
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
                { role: "pasteAndMatchStyle" },
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
            { type: 'separator' },
            { role: 'resetzoom' },
            { role: 'zoomin' },
            { role: 'zoomout' },
            { type: 'separator' },
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
    var historyMenu = {
        label: "History",
        submenu: [
            {
                label: "Back",
                accelerator: "CmdorCtrl+[",
                click: function (menuItemm, focusedWindow) {
                    focusedWindow.webContents.goBack();
                }
            },
            {
                label: "Forward",
                accelerator: "CmdorCtrl+]",
                click: function (menuItemm, focusedWindow) {
                    focusedWindow.webContents.goForward();
                }
            }
        ]
    };
    var windowMenu = {
        role: "windowMenu",
        submenu: isElectronMac
            ? [
                { role: "minimize" },
                { role: "zoom" },
                { type: "separator" },
                { role: "selectPreviousTab", label: "Show Previous Tab", accelerator: "Ctrl+Shift+Tab" },
                { role: "selectNextTab", label: "Show Next Tab", accelerator: "Ctrl+Tab" },
                { role: "moveTabToNewWindow", label: "Move Tab to New Window" },
                { role: "mergeAllWindows", label: "Merge All Windows" },
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
                    shell.openExternal("https://www.notion.so/help");
                },
            },
        ],
    };
    var appMenu = {
        role: "appMenu",
        submenu: [
            { role: "about" },
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
        historyMenu,
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