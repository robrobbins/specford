var fs = require('fs');
var L = require('../src/lexer');
var I = require('../src/iterator');
var R = require('../src/rewriter/slimer');
var l = new L;
var i = new I;
var r = new R;

module.exports = {
  run: (spec) => {
    let txt = fs.readFileSync(`../spec/${spec}.spec`, 'utf8');
    i.initialize(l.tokenize(txt));
    console.log(r.rewrite(i));
  }
};
