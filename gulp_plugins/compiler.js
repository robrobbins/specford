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
      var script = rewriter.rewrite(iterator);

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
