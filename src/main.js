const { app, BrowserWindow } = require('electron');
require('@electron/remote/main').initialize();


const createWindow = () => {
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      minWidth:830,
      minHeight:230,
      webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
          enableRemoteModule: true
      },
      title: "JSON Tabled",
    });
    require("@electron/remote/main").enable(win.webContents);
    win.loadFile('src/index.html');
    // win.setMenuBarVisibility(false);
    win.removeMenu(true); // removes entirely
    // ctrl + shift + i
  }

  app.whenReady().then(() => {
    createWindow();
  
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });