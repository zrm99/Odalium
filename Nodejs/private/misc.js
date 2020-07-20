const fs = require('fs');

// This file's purpose is to provide miscellaneous helper functions
// to support the nodeserver.

module.exports = {

  createLogFile: function createLogFile() {
    var d = new Date();
    var date = d.getMonth() + '_' + d.getDate() + '_' + d.getFullYear();
    var fileName = date + '-log' + '.txt';
    fs.access('logs/', fs.F_OK, function(err) {
       if (err) {
         fs.open('logs/' + fileName, 'w', function(err) {
           if (err) {
             return console.log(err);
           }
         });
       }
    });
    return fileName;
  },
  appendLogFile: function appendLogFile(fileName, fileData) {
    var d = new Date();
    var time = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + ':' + d.getMilliseconds();
    fileData = fileData + ' (' + time + ')' + '\n';
    fs.appendFile('logs/' + fileName, fileData, function(err) {
      if (err) {
        return console.log(err);
      }
    });
  },

}
