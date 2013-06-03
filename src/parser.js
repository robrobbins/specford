var fs = require('fs'),
  $ = require('sudoclass'),
  Lexer = require('./lexer'),
  Rewriter = require('./rewriter'),
  Filewriter = require('./filewriter');

  // the parser reads a config JSON file and transforms it inta a set of instructions
  Parser = function(path) {
    this.construct({path: path});
    Object.extend(this, $.extensions.observable);

    // the Lexer Delegate will Observe the Parser's
    // 'fileContents' key and tokenize it when available
    this.addDelegate(new Lexer());

    // the Rewriter takes the tokens set by the parser ond
    // uses its iterator delegate to get an instruction set
    // which it then uses to prepare the content for the tmp file(s)
    // setting the code(s) here
    this.addDelegate(new Rewriter());

    // the filewriter observes the 'code' key, then
    // writes the spec file `specs/foo.spec` => `scripts/foo.js`
    this.addDelegate(new Filewriter(path));

    // TODO roll this into the sudo base class then remove these
    this.delegate('lexer').addedAsDelegate(this);
    this.delegate('rewriter').addedAsDelegate(this);
    this.delegate('filewriter').addedAsDelegate(this);

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
    fs.readFile(this.get('path'), 'utf8', function(err, data) {
      if(err) return this.error('READERROR');
      this.set('fileContents', data);
    }.bind(this));
  } 
});

module.exports = Parser;
