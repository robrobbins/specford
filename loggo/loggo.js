require('babel/register');

module.exports = {

  lexer: function(spec) {
    var l = require('./lexer-log');
    l.run(spec);
  },

  iterator: function(spec) {
    var i = require('./iterator-log');
    i.run(spec);
  }
};
