var fs = require('fs');
var colorizer = require('./colorizer');

var Reporter = function() {};

Reporter.prototype.passed = function() {
  this.write(colorizer.color('.', 'info'));
};

Reporter.prototype.failed = function() {
  this.write(colorizer.color('f', 'error'));
};

Reporter.prototype.write = function(result) {
  fs.write('/dev/stdout', result, 'w');
};

Reporter.prototype.summarize = function(elapsed, total, failures) {
  elapsed = Math.floor(elapsed / 100) / 10;
  var info = colorizer.color(
    "\nFinished: " + total + ' assertions in ' + elapsed + 's', 'parameter');
    //passed = colorizer.colorize('Passed: ' +passes, 'greenBar', 24),
  var failed = colorizer.color('Failed: ' + failures.length, 'error');

  console.log(info);
  //this.write(passed);
  if (failures.length) {
    console.log(failed);
    failures.forEach(function(fail) {
      console.log(colorizer.color(fail, 'comment'));
    });
  }
};

module.exports = Reporter;
