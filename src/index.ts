import { app, BrowserWindow, ipcMain, session } from 'electron';
import { debug } from './utils'
import updateElectronApp from 'update-electron-app'
// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

const onReady = (): void => {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                //   'Content-Security-Policy': ['default-src \'none\'']
                'Content-Security-Policy': ['*'] // 为了支持代理
            }
        })
    })

    // Create the browser window.
    const mainWindow = new BrowserWindow({
        height: 1000,
        width: 1400,
        webPreferences: {
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
            nodeIntegration: true,
        },
    });

    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    // Open the DevTools.
    if (process.env.NODE_ENV==='development') {
        mainWindow.webContents.openDevTools();
    }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', onReady);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        onReady();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

import Store from 'electron-store'
const store = new Store()
ipcMain.handle('getStoreValue', (event, key) => {
    return store.get(key);
});
ipcMain.handle('setStoreValue', (event, key, data) => {
    return store.set(key, data);
});
debug('store path', store.path)

updateElectronApp()