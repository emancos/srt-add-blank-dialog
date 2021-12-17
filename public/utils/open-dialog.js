const { dialog } = require('electron')

const openDialogFileSelection = () => {
    return dialog
    .showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Legeda SRT', extensions: ['srt'] }],
    })
    .then(fileName => fileName.filePaths)
    // should always handle the error yourself, later Electron release might crash if you don't
    .catch(function (err) {
      console.error(err)
    })
}

module.exports = {
    openDialogFileSelection,
}