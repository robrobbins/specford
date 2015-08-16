require('babel/register');

var path = require('path');
var through = require('through2');
var util = require('gulp-util');
var PluginError = util.PluginError;

var Lexer = require('../src/lexer');
var lexer = new Lexer;

var Iterator = require('../src/iterator');
var iterator = new Iterator;

var Rewriter = require('../src/rewriter/slimer');
var rewriter = new Rewriter;

// consts
const PLUGIN_NAME = 'compiler';

function specformatter(code)
{
  reasons = '';
  // Take the code and prepend each line with a line number
  numerate_code = code.split('\n');
  for(var i = 0;i < numerate_code.length;i++){
    numerate_code[i] = util.colors.gray((i+1)+': ')
    + numerate_code[i] + '\n';
  }
  // Take each line number and count the terms
  test_split = code.split("\n");
  for(var i = 0;i < numerate_code.length;i++){
      // if a line has quoted string, remove spaces between quotes
      test_split[i] = test_split[i].replace(/'.*?'/, 'term');
      terms = test_split[i].split(" ");
      term_count = 0
    for(var j = 0;j < terms.length;j++){
      if (terms[j] != '') { term_count += 1; }
   }
   if (term_count == 2) { 
    if (test_split[i].trim().substring(0,5) == 'visit'){}
      // util.log("visit detected")
    else if (test_split[i].trim().substring(0,5) == 'query'){}
      // util.log("query detected")
    else
      reasons += "Two terms detected on line " + (i+1) + '\n';
    }
    else if (term_count == 4){
      if (test_split[i].trim().substring(0,5) == 'after'){}
      else
        reasons += "Four terms detected on line " + (i+1) + '\n';
    }
    else if (term_count != 3){
      if (test_split[i].trim() == ''){}
      else
        reasons += "Line " + (i+1) + ' violates rule of 3\n'; 
    }
   }


  return [numerate_code.join("\0"), reasons]
}

function compile() {

  // creating a stream through which each file will pass
  var stream = through.obj(function(file, enc, cb) {
    if (file.isStream()) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
      return cb();
    }

    if (file.isBuffer()) {
      // just for the logging
      var name = path.basename(file.path);
      var spec = file.contents.toString('utf8');

      util.log(util.colors.gray('Tokenizing'), util.colors.yellow(name));
      var tokens = lexer.tokenize(spec);

      util.log(util.colors.gray('Iterating'), util.colors.yellow(name));
      iterator.initialize(tokens);

      util.log(util.colors.gray('Rewriting'), util.colors.yellow(name));
      try{
      var script = rewriter.rewrite(iterator);
    } catch (e)
    {
      util.log('Syntax error: \n' + specformatter(spec)[0]);
      util.log('\nReasons: \n' + specformatter(spec)[1]);
      var script = '// Syntax error, exiting \n slimer.exit();'
    }

      file.contents = new Buffer(script);
    }

    // make sure the file goes through the next gulp plugin
    this.push(file);

    // tell the stream engine that we are done with this file
    cb();
  });

  // returning the file stream
  return stream;
}

// exporting the plugin main function
module.exports = compile;
