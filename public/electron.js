// Module to control the application lifecycle and the native browser window.
const { app, BrowserWindow, Menu, ipcMain, protocol } = require('electron')

const path = require('path')
const url = require('url')
const fs = require('fs')
const fileEncode = require('detect-file-encoding-and-language')
require('dotenv').config()

const { openDialogFileSelection } = require('./utils/open-dialog')
const { saveDialogNewFile } = require('./utils/save-dialog')
const { delay } = require('./functions/delay-function')
const { showSubtitle } = require('./functions/show-subtitle')

let srtSubtitle = []
let newSrtSubtitle = {}

const menu = Menu.buildFromTemplate([
  {
    label: 'Arquivo',
    submenu: [
      {
        label: 'Carregar legenda',
        accelerator: 'CmdOrCtrl+O',
        async click() {
          // construct the select file dialog{
          const dataFile = await getDataFile()
          mainWindow.webContents.send('file-selected', { ...dataFile })
        },
      },
      { 
        label: 'Salvar' },
      { 
        label: 'Salvar como...',
        accelerator: 'CmdOrCtrl+S',
        async click() {           
          const { text, path } = newSrtSubtitle
          const dataNewFile = await saveNewFile(text, path)
          if(dataNewFile) {
            mainWindow.webContents.send('file-selected', { ...dataNewFile })
          }
        }
      },
      { type: 'separator' },
      { label: 'Fechar', role: 'quit' },
    ],
  },
  { label: 'Sobre', role: 'about' },
])

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 600,
    icon: path.join(__dirname, './assets/icons/icon-white.png'),
    //maximizable: false,
    //resizable: false,
    // Set the path of an additional "preload" script that can be used to
    // communicate between node-land and browser-land.
    webPreferences: {
      nodeIntegration: false,
      nodeIntegrationInWorker: false,
      nodeIntegrationInSubFrames: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  Menu.setApplicationMenu(menu)
  // In production, set the initial browser path to the local bundle generated
  // by the Create React App build process.
  // In development, set it to localhost to allow live/hot-reloading.
  const appURL = app.isPackaged
    ? url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true,
      })
    : 'http://localhost:3000'
    
  mainWindow.loadURL(appURL, {
    extraHeaders: `Content-Security-Policy: script-src 'self'`,
  })

  mainWindow.webContents.on('ready-to-show', () => {
    const { tittle, version } = require('../package.json')
    mainWindow.setTitle(`${tittle} ${version}`)
  })

  if (!app.isPackaged) mainWindow.webContents.openDevTools()
}

// Setup a local proxy to adjust the paths of requested files when loading
// them from the local production bundle (e.g.: local fonts, etc...).
function setupLocalFilesNormalizeProxy() {
  protocol.registerHttpProtocol(
    'file',
    (request, callback) => {
      const url = request.url.substr(8)
      callback({ path: path.normalize(`${__dirname}/${url}`) })
    },
    (error) => {
      if (error) console.error('Failed to register protocol')
    }
  )
}

// This method will be called when Electron has finished its initialization and
// is ready to create the browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()
  setupLocalFilesNormalizeProxy()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS.
// There, it's common for applications and their menu bar to stay active until
// the user quits  explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// If your app has no need to navigate or only needs to navigate to known pages,
// it is a good idea to limit navigation outright to that known scope,
// disallowing any other kinds of navigation.
const allowedNavigationDestinations = 'https://srt-add-blank-speech.com'
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl)

    if (!allowedNavigationDestinations.includes(parsedUrl.origin)) {
      event.preventDefault()
    }
  })
})

ipcMain.on('click-button', async (event, args) => {
  if (args) {
    const dataFile = await getDataFile()
    mainWindow.webContents.send('file-selected', { ...dataFile })
  }
})

ipcMain.on('subtitle-show', (event, args) => {
  if (args.openFile) {
    const srt = createArrayFromFile(args.filePath, args.encoding)
    showSubtitle(mainWindow ,srt)
  }
})

ipcMain.on('process-subtitle', async (event, args) => {
  if(args.filePath) {
    const file = createArrayFromFile(args.filePath, args.encoding)
    const srt = await addBlankDialog(file)
    newSrtSubtitle.text = await processNewFileSrt(srt)
    newSrtSubtitle.path = args.filePath
    mainWindow.webContents.send('new-srt-file', newSrtSubtitle.file)
  }
})

async function getDataFile(filePath /*optional*/) {
  let totalDialogs = 0

  try {
    const fileSelected = await (typeof filePath !== 'undefined' ? filePath : openDialogFileSelection())
    const filesize = await ((fs.statSync(fileSelected[0]).size) / 1024).toFixed(2)
    const { encoding, language } = await encodingFile(fileSelected[0])
    srtSubtitle = createArrayFromFile(fileSelected[0], encoding)
    totalDialogs = srtSubtitle[srtSubtitle.length - 1].num
    return {
      filePath: fileSelected[0],
      encoding,
      language,
      totalDialogs,
      filesize,
    }

  } catch (err) {
    return
  }
}

/*
  This function aims to create the array 
  to process the subtitle dialogs.
*/
function createArrayFromFile(filePath, encoding) {
  // temporary variable that store dialogs for processing.
  let dialog1 = {}
  // Array that store dialogs
  let srtSubtitleDialogs = []
  /*  
      mask to check if the text matches the dialog duration 
      and also if it is not an empty line 
  */
  const maskTime = /[0-9]{2}:[0-9]{2}:[0-9]{2},[0-9]{3}/g

  /*  
      Read the file and store the lines in the temporary constant
  */
  const readable = fs.readFileSync(filePath, encoding)
  const line = [...readable.split(/\r\n|\n/g)]
  
  /*  
      Loop for creating the objects with the structure 
      of the dialogs to be stored in the array
  */
 for (const i in line) {
    if (!dialog1.num || !dialog1.time) {
      if (!isNaN(line[i])) {
        dialog1.num = line[i]
      } else if (line[i].match(maskTime)) {
        dialog1.time = line[i]
      }
    } else if (isNaN(line[i]) && !line[i].match(maskTime)) {
        dialog1.dialog = dialog1.dialog 
        ? (dialog1.dialog + `${line[i]}\r\n`) 
        : `${line[i]}\r\n` 
    }
    
    if (dialog1.dialog) {
      if (parseInt(line[i].length) === 0 || parseInt(i) === line.length - 1){
        srtSubtitleDialogs.push({ ...dialog1 })
        dialog1 = {}
      }      
    } else if(line[i].match('\u200e')) {
        if(isNaN(line[i + 2])) {
          dialog1.dialog = '\u200e \r\n'
          srtSubtitleDialogs.push({ ...dialog1 })
          dialog1 = {}
        }
    }
  }
  for (let i = 0; i < srtSubtitleDialogs.length; i++) {
    srtSubtitleDialogs[i].num = i + 1        
  }
  return srtSubtitleDialogs
}

async function addBlankDialog(srt) {
  let soma = 0
  let newSrt = []

  let blankDialog = {
    num: 0,
    time: '',
    dialog: '\u200e \r\n', //`${String.fromCharCode(160)}\r\n`,*/
  }

  for (const [i, dialogs] of srt.entries()) {
    await delay(8)
    await mainWindow.webContents.send('srt-processing', parseInt(i+1))    
    if (srt[i + 1]) {
      soma = getTimeInterval(srt[i], srt[i + 1])
      if (soma > 500) {
        blankDialog.num = 0
        blankDialog.time = await newTime(dialogs.time)
        newSrt.push({ ...dialogs })
        newSrt.push({ ...blankDialog })
      } else {
        newSrt.push({ ...dialogs })
      }
    } else {
      blankDialog.num = 0
      dialogs.num = 0
      blankDialog.time = await newTime(dialogs.time)
      blankDialog.dialog = 'Legenda processada!\r\n' //`${String.fromCharCode(160)}`
      newSrt.push({ ...dialogs })
      newSrt.push({ ...blankDialog })
      for (let i = 0; i < newSrt.length; i++) {
        newSrt[i].num = i + 1        
      }
    }
  }
  return { ...newSrt }
}

async function encodingFile(filePath) {
  const { encoding, language } = await fileEncode(filePath).then(
    (encodeInfo) => encodeInfo
  )
  return {
    encoding: encoding === 'UTF-8' ? 'utf8' : 'latin1',
    language: language ? language : 'Não identificado',
  }
}

function newTime(oldTime) {
  return (
    oldTime
      .substr(17, 12)
      .replace(/,[0-9]{3}/g, `,${parseInt(oldTime.substr(26, 3)) + 100}`) +
      ' --> ' +
    oldTime
      .substr(17, 12)
      .replace(/,[0-9]{3}/g, `,${parseInt(oldTime.substr(26, 3)) + 110}`)
  )
}

function getTimeInterval(t1, t2) {
  const soma =
    parseInt(t1.time.substr(23, 7).replace(/[:,]/g, '')) -
    parseInt(t2.time.substr(6, 7).replace(/[:,]/g, ''))
  return soma < 0 ? (soma * -1) : soma
}

async function processNewFileSrt(srt)  {
  let newFileSrt = ''
  for(const i in srt) {
    newFileSrt = newFileSrt + srt[i].num + '\n' + srt[i].time + '\n' + srt[i].dialog + '\n'
  }  
  return newFileSrt
}

async function saveNewFile(srt, defaultPath) {
  const { canceled, filePath } = await saveDialogNewFile({ mainWindow, defaultPath })
  if(!canceled) {
    await fs.writeFileSync(filePath, srt, { encoding: 'utf8' })
    await delay(300) /// waiting 300 milliseconds for load data.
    const dataNewFile = await getDataFile([filePath])
    await mainWindow.webContents.send('srt-processing', 0)
    return dataNewFile
  }
}

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

