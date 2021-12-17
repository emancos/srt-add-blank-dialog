const { ipcRenderer, ipcMain, webFrameMain, BrowserWindow } = require('electron')
const Main = require('electron/main')
const { openDialogFileSelection } = require('./open-dialog')

const template = [
  {
    label: 'Arquivo',
    submenu: [
      {
        label: 'Carregar legenda',
        accelerator: 'CmdOrCtrl+O',
        async click() {
          // construct the select file dialog{
            const fileSelected = await openDialogFileSelection()
            BrowserWindow.webContents.send('file-selected', { file: fileSelected[0] })
        },
      },
      { label: 'Salvar' },
      { label: 'Salvar como...' },
      { type: 'separator' },
      { label: 'Fechar', role: 'quit' },
    ],
  },
  { label: 'Sobre', role: 'about' },
]

module.exports = { template }
