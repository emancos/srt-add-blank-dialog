const { dialog } = require('electron')

const saveDialogNewFile = (data) => {
    const { mainWindow, defaultPath } = data

    return dialog
    .showSaveDialog(mainWindow, {
      title: 'Salvar arquivo…',
      buttonLabel: 'Salvar',
      properties: ['createDirectory', 'showOverwriteConfirmation', 'dontAddToRecent'],
      defaultPath,
      filters: [{ name: 'Legeda SRT', extensions: ['srt'] }],
    })
    .then(fileName => fileName)
    // should always handle the error yourself, later Electron release might crash if you don't
    .catch(function (err) {
      console.error(err)
    })
}

module.exports = {
    saveDialogNewFile
}