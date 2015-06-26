var fs = require('fs');
var L = require('../src/lexer');
var I = require('../src/iterator');
var l = new L;
var i = new I;

module.exports = {
  run: (spec) => {
    let txt = fs.readFileSync(`../spec/${spec}.spec`, 'utf8');
    i.initialize(l.tokenize(txt));

    for (let step of i) {
      console.log(step);
    }
  }
};
