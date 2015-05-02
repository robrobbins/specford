require('babel/register');
var EventEmitter = require('events').EventEmitter,
 fs = require('fs');

class Parser extends EventEmitter {
  constructor() {
    super();

    this.findError = (path) => `Cannot locate file at ${path}`;
    this.readError = (path) => `Cannot read file at ${path}`;
    this.parseError = (string) => `Cannot parse string ${string}`;
  }

  read(path) {
    fs.exists(path, (exists) => {
      exists ? this.readFile(path) : this.onError(this.findError(path));
    });
  }

  readFile(path) {
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) return this.onError(this.readError(path));
      this.emit('read', data);
    });
  }

  onError(err) {
    this.emit('error', err);
  }
}

module.exports = Parser;
