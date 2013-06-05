var fs = require('fs'),
  L = require('./src/lexer'),
  l = new L(),
  code, tokens;

code = fs.readFileSync('specs/' + process.argv[2], 'utf8');

tokens = l.tokenize(code);

console.log(tokens);


