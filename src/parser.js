var $ = require('sudoclass'),
  rw = require('./rewriter'),
  fs = require('fs'),

  // the parser reads a config JSON file and transforms it inta a set of instructions
  Parser = function(path) {
    this.construct({path: path});
    Object.extend(this, $.extensions.observable);

    this.addDelegate(new $.delegates.Change({
      filters: {
        'fileContents': 'fileRead',
        'parsedContents': 'fileParsed'
      }
    }));

    this.observe(this.delegate('change', 'filter'));

    this.FINDERROR = 'Cannot locate file at ${0}';
    this.READERROR = 'Cannot read file at ${0}';
    this.PARSEERROR = 'Cannot parse string ${0}';
  };

Parser.prototype = Object.extend(Object.create($.Model.prototype), {
  read: function() {
    fs.exists(this.get('path'), function(exists) {
      exists ? this.readFile() : this.error('FINDERROR');
    }.bind(this));
  },
  error: function(which) {
    this.set('error', this[which].expand([this.get('path')]));
  },
  readFile: function() {
    fs.readFile(this.get('path'), {encoding: 'utf8'}, function(err, data) {
      if(err) return this.error('READERROR');
      this.set('fileContents', data);
    }.bind(this));
  },
  fileRead: function(change) {
    // in a try catch as json may be malformed
    try {
      this.set('parsedContents', JSON.parse(change.value));
    } catch(err) {
      this.error('PARSEERROR');
    } 
  },
  fileParsed: function(change) {
    // pull out the initial visit
    var init = change.visit;
    // specford will observe this and put the instruction set
    // together via the rewriter
    this.set('initialVisit', change.value.visit);
  }
});

module.exports = Parser;
