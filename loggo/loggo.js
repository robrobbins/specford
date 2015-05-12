require('babel/register');

var functions = {
  lexer: function(spec) {
    var l = require('./lexer-log');
    l.run(spec);
  },

  iterator: function(spec) {
    var i = require('./iterator-log');
    i.run(spec);
  },

  rewriter: function(spec) {
    var r = require('./rewriter-log');
    r.run(spec);
  },

  parser: function(spec) {
    var p = require('./parser-log');
    p.run(spec);
  }
};

functions[process.argv[2]](process.argv[3]);
