// Call with a specific .spec file or nothing to run all 

var walk = require('walk'),
  $ = require('sudoclass'),
  Parser = require('./src/parser.js'),
  exec = require('child_process').exec,
  parsing = 'Parsing ${count} .spec files.',
  casper = 'casperjs ${root}${name}',
  end = 'Fording ${count} specs:',
  walkOpts = {
    followLinks: false
  },
  // the inital 2 are always present
  args = process.argv.slice(2),
  execScripts, compileSpecs, parser, child, compile, cIndex, 
  scriptWalker, specWalker, count, next;

execScripts = function() {
  count = 0;

  scriptWalker = walk.walk('scripts/', walkOpts);

  scriptWalker.on('file', function(root, stats, next) {

    if(stats.name !== '.DS_Store') {
      count++;
    // we pipe the output of casper through the stdout
      child = exec(casper.expand({root: root, name: stats.name}), function(e, so, se) {
        console.log(so);
      });
    }
    next();
  });

  scriptWalker.on('errors', function(root, arry, next) {
    console.log('Error?');
    next();
  });

  scriptWalker.on('end', function() {
    console.log(end.expand({count: count}));
  });
};

compileSpecs = function(parser) {
  count = 0;

  specWalker = walk.walk('specs/', walkOpts);

  specWalker.on('file', function(root, stats, next) {
    count++;
    parser = new Parser(root + stats.name);
    parser.read();
    next();
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
// if there arent any passed in args, just loop over all 
// .js compiled spec files with casper and output the result.
// we use the npm 'walk' module in the case that specs are 
// nested
if(!args.length) {
 execScripts();
} else {
  // we have some specific argument(s)
  // if any are --compile that needs to be handled first
  cIndex = args.indexOf('--compile');

  if(cIndex !== -1) {
    if(args.length > 1) {
      // everything after the --compile
      next = cIndex + 1;
      // specific or all spec files need to be compiled first,
      // skip the 'flag'
      compile = args.splice(next, (args.length - next));
    } else {
      compileSpecs();
    }
  } else {
    // not compiling anything just running a specific spec or dir of them
  }
}
