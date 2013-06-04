var fs = require('fs'),
  path = require('path'),
  $ = require('sudoclass'),

  Filewriter = function(filename) {
    if(filename) this.setFileName(filename);
    this.writeError = 'Error writing spec file';
  };

Filewriter.prototype = Object.extend({}, {
  addedAsDelegate: function(delegator) {
    delegator.observe(this.handleChange.bind(this));
  },

  handleChange: function(change) {
    // if any more keys are observed, use a change delegate
    if(change.name === 'path') this.setFileName(change.object.path);
    else if(change.name === 'code') this.writeSpec(change.object.code);
  },

  role: 'filewriter',

  setFileName: function(filename) {
    this.filename = filename.replace('specs/', 'scripts/').replace('.spec', '.js');
  },

  specWritten: function(err) {
    if(err) this.delegator.set('error', this.writeError);
    else this.delegator.set('specWritten', true);
  },

  writeSpec: function(code) {
    console.log('writing ' + this.filename);
    fs.writeFile(this.filename, code, 'utf8', 
      this.specWritten.bind(this));
  }
});

module.exports = Filewriter;
