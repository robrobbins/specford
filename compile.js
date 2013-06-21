// Call with a specific .spec file or nothing to compile all 

var walk = require('walk'),
  $ = require('sudoclass'),
  Parser = require('./src/parser.js'),
  parsing = 'Parsed ${count} .spec files.',
  walkOpts = {
    followLinks: false
  },
  // the inital 2 are always present
  args = process.argv.slice(2),
  parser, specWalker, count;

compileSpec = function(path) {
  new Parser('specs/' + path + '.spec').read();
};

compileSpecs = function() {
  var count = 0;

  specWalker = walk.walk('specs/', walkOpts);

  //specWalker.on('names', function(root, arry) {
    //arry.forEach(function(name) {console.log(name);});
  //});

  specWalker.on('file', function(root, stats, next) {
    if(stats.name !== '.DS_Store') {
      count++;
      new Parser(root + stats.name).read();
      next();
    } else next();
  });

  specWalker.on('errors', function(root, arry, next) {
    console.log('Error?');
    next();
  });

  specWalker.on('end', function() {
    console.log(parsing.expand({count: count}));
  });
};

// ------------------------------------- main --------------------------------
// if there arent any passed in args, just loop over all.
// we use the npm 'walk' module in the case that specs are 
// nested
if(!args.length) {
 compileSpecs();
} else {
  args.forEach(function(path) {
    compileSpec(path);
  });
}
