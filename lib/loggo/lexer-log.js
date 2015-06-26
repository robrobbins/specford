var fs = require('fs');
var L = require('../src/lexer');
var l = new L;

module.exports = {
  run: (spec) => {
    let txt = fs.readFileSync(`../spec/${spec}.spec`, 'utf8');

    console.log(l.tokenize(txt));
  }
};
