require('babel/register');

var functions = {
  lexer: function(spec) {
    var l = require('./lexer-log');
    l.run(spec);
  },

  iterator: function(spec) {
    var i = require('./iterator-log');
    i.run(spec);
  }
};

functions[process.argv[2]](process.argv[3]);
