var fs = require('fs'),
  $ = require('sudoclass'),
  Lexer = require('./lexer');

  // the parser reads a config JSON file and transforms it inta a set of instructions
  Parser = function(path) {
    this.construct({path: path});
    Object.extend(this, $.extensions.observable);

    this.addDelegate(new $.delegates.Change({
      filters: {'fileContents': 'fileRead'}
    }));

    this.lexer = new Lexer();

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
    // we need no get the text into a state that the rewriter can use
    // first the lexer tokenizes the spec file
    this.set('tokens', this.lexer.tokenize(change.value));
  }
});

module.exports = Parser;
