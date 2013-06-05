var fs = require('fs'),
  util = require('util'),
  L = require('./src/lexer'),
  I = require('./src/iterator'),
  l = new L(),
  wrapLvl = 0,
  indent, code, tokens, i, instructions, unwrap;

unwrap = function(arry) {
  arry.forEach(function(item) {
    if(item.indented) indent = item.indented;
    if(Array.isArray(item)) {
      unwrap(item);
    } else {
      console.log(printLvl() + item);
    }
  });
};

printLvl = function(item) {
  var i, a = ['> '];
  for(i = indent; i > 0; i--) {
    a.unshift('-');
  }
  return a.join('');
};

code = fs.readFileSync('specs/' + process.argv[2], 'utf8');

tokens = l.tokenize(code);

i = new I();

instructions = i.makeInstructionSet(tokens);

// unwrap the nested queries and show them
unwrap(instructions);
