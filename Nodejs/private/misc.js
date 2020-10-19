const fs = require('fs');

// This file's purpose is to provide miscellaneous helper functions
// to support the nodeserver.

module.exports = {

  createLogFile: function createLogFile() {
    let d = new Date();
    let date = d.getMonth() + '_' + d.getDate() + '_' + d.getFullYear();
    let fileName = date + '-log.txt';
    fs.access('logs/', fs.F_OK, function(err) {
      if (err) {
        fs.open('logs/' + fileName, 'w', function() {
          if (err) {
            return console.log(err);
          }

          return fs.F_OK;
        });
      }
    });

    return fileName;
  },
  appendLogFile: function appendLogFile(fileName, fileData) {
    let d = new Date();
    let time = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + ':' + d.getMilliseconds();
    let fileDataWithTime = fileData + ` (${time})`;
    fs.appendFile('logs/' + fileName, fileDataWithTime, function(err) {
      if (err) {
        return console.log(err);
      }

      return fs.F_OK;
    });
  },

}
