// Call with a specific .spec file or nothing to run all 

var walk = require('walk'),
  $ = require('sudoclass'),
  Parser = require('./src/parser.js'),
  exec = require('child_process').exec,
  parsing = 'Parsed ${count} .spec files.',
  phantom = 'phantomjs ${root}${name}',
  end = 'Fording ${count} specs:',
  walkOpts = {
    followLinks: false
  },
  // the inital 2 are always present
  args = process.argv.slice(2), execCb,
  execScripts, compileSpecs, parser, child, compFlag, 
  cfi, scriptWalker, specWalker, count, runFlag, rfi;

execCb = function(e, so, se) {console.log(so);};

execScript = function(path) {
  exec(phantom.expand({root: 'scripts/', name: path}), execCb);
};

execScripts = function() {
  count = 0;

  scriptWalker = walk.walk('scripts/', walkOpts);

  scriptWalker.on('file', function(root, stats, next) {
    // FIXME why fiter no workee for dsstore?
    if(stats.name !== '.DS_Store') {
      count++;
      // we pipe the output of phantom through the stdout
      exec(phantom.expand({root: root, name: stats.name}), execCb);
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

compileSpec = function(path) {
  parser = new Parser('specs/' + path);
  parser.read();
};

compileSpecs = function() {
  parser = new Parser(); count = 0;

  specWalker = walk.walk('specs/', walkOpts);

  //specWalker.on('names', function(root, arry) {
    //arry.forEach(function(name) {console.log(name);});
  //});

  specWalker.on('file', function(root, stats, next) {
    if(stats.name !== '.DS_Store') {
      count++;
      parser.set('path', root + stats.name);
      // pass the next to the Parser to be called when ready
      parser.read(next);
    }
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
// .js compiled spec files with phantom and output the result.
// we use the npm 'walk' module in the case that specs are 
// nested
if(!args.length) {
 execScripts();
} else {
  // we have some specific argument(s)
  // if any are --compile/--run that needs to be handled first
  cfi = args.indexOf('--compile');
  // cant inline this as -1 != falsey
  if(cfi !== -1) compFlag = args.splice(cfi, 1);
  rfi = args.indexOf('--run');
  if(rfi !== -1) runFlag = args.splice(rfi, 1);

  if(compFlag) {
    // only compile specific files if there are any
    if(args.length) {
      args.forEach(function(path) {
        compileSpec(path);
      });
    } else {
      compileSpecs();
    }
    // --run only should be passed if --compile was
    if(runFlag) {
      if(args.length) {
        args.forEach(function(path) {
          execScript(path.replace('.spec', '.js'));
        });
      } else {
        // running them all
        execScripts();
      }
    }
  } else {
    // there were args, but none compiled, run them
    // should be scripts/
    args.forEach(function(path) {
      execScript(path);
    });
  }
}
