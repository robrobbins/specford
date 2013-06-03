var fs = require('fs'),
  path = require('path'),
  $ = require('sudoclass'),

  Filewriter = function(filename) {
    this.filename = filename.replace('specs/', 'scripts/').replace('.spec', '.js');
    this.writeError = 'Error writing spec file';
  };

Filewriter.prototype = Object.extend({}, {
  addedAsDelegate: function(delegator) {
    delegator.observe(this.writeSpec.bind(this));
  },

  role: 'filewriter',

  specWritten: function(err) {
    if(err) this.delegator.set('error', this.writeError);
    else this.delegator.set('specWritten', true);
  },

  writeSpec: function(change) {
    if(change.name !== 'code') return;
    fs.writeFile(this.filename, change.object.code, 'utf8', 
      this.specWritten.bind(this));
  }
});

module.exports = Filewriter;
