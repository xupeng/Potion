const { BrowserWindow, BrowserView, app } = require('electron');
const path = require('path');
const log = require('electron-log');
const settings = require('electron-settings');
const { readFile } = require('fs');
const os = require('os');

function newWindow(url = null, windowBounds = null) {
    let win = new BrowserWindow({
        title: 'Potion',
        tabbingIdentifier: 'Potion',
        backgroundThrottling: false,
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
    log.debug('New window with URL:', url, win.id)
    win.loadURL(url)

    win.webContents.on('did-finish-load', function () {
        injectCSS(win)
    })

    win.webContents.setWindowOpenHandler(({ url }) => {
        if (url.match(/^https:\/\/(www\.)?notion.so/)) {
            newTab(url)
        } else {
            const { shell } = require('electron')
            shell.openExternal(url)
        }
    })

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
    let lastID = 0
    let windows = BrowserWindow.getAllWindows()
    windows.forEach(window => {
        if (window.id > lastID) {
            lastID = window.id
        }
    });
    let win = BrowserWindow.fromId(lastID)
    if (!url) {
        url = BrowserWindow.getFocusedWindow().webContents.getURL()
    }
    let tw = newWindow(url, null)
    win.addTabbedWindow(tw)
}

function injectCSS(win) {
    css_file = path.join(os.homedir(), '.potion', 'style.css')
    readFile(css_file, "utf-8", (err, data) => {
        if (!err) {
            win.webContents.insertCSS(data)
        }
    })
}

function loadWindowBounds() {
    return settings.get('windowBounds')
}

function saveURLs() {
    let lastUrls = []
    if (BrowserWindow.getFocusedWindow()) {
        let savedWindows = new Set([])
        let startWindow
        while (true) {
            startWindow = BrowserWindow.getFocusedWindow()
            if (savedWindows.has(startWindow.id)) {
                break
            }
            savedWindows.add(startWindow.id)
            log.debug(startWindow.id, startWindow.webContents.getTitle(), startWindow.webContents.getURL())
            lastUrls.push(startWindow.webContents.getURL())
            startWindow.selectNextTab()
        }
    } else {
        let windows = BrowserWindow.getAllWindows()
        windows.forEach(window => {
            lastUrls.push(window.webContents.getURL())
        })
    }
    settings.set('lastUrls', lastUrls)
}

function loadURLs() {
    return settings.get('lastUrls')
}

exports.newTab = newTab;
exports.injectCSS = injectCSS;
exports.newWindow = newWindow;
exports.loadWindowBounds = loadWindowBounds;
exports.saveURLs = saveURLs;
exports.loadURLs = loadURLs;