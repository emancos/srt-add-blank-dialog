const { BrowserWindow } = require('electron')
const path = require('path')
/*
  This function aims to get the text encoding
*/
async function showSubtitle(mainWindow, srt) {
    const childWindow = new BrowserWindow({
      parent: mainWindow,
      modal: true,
      show: false,
      width: 600,
      height: 600,
      webPreferences: {
        nodeIntegration: false,
        nodeIntegrationInWorker: false,
        nodeIntegrationInSubFrames: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, '../preload.js'),
      },
    })
    childWindow.loadURL(`http://localhost:3000/subtitle-show`)
    //childWindow.openDevTools()
    childWindow.setMenuBarVisibility(false)
    childWindow.on('ready-to-show', () => {
      childWindow.show()
      const { tittle, version } = require('../../package.json')
      childWindow.setTitle(`${tittle} ${version}`)
      childWindow.webContents.send('subtitle-content', srt)
    })
  }

  module.exports = { showSubtitle }