var Logger = require('./logger');
var log = new Logger;
var expand = require('./util').expand;

var Reporter = function() {
  this.finished = "\nFinished ${total} assertions in ${elapsed}s";
  this.count = "Failed: ${count}";
};

Reporter.prototype.passed = function() {
  log.write('.', 'greenBold');
};

Reporter.prototype.failed = function() {
  log.write('f', 'redBold');
};

Reporter.prototype.summarize = function(elapsed, total, failures) {
  elapsed = Math.floor(elapsed / 100) / 10;

  let info = expand(this.finished, { total: total, elapsed: elapsed });
  let failed = expand(this.count, { count: failures.length });

  log.unstamped(info, 'cyan');

  if (failures.length) {
    log.unstamped(failed, 'red');
    failures.forEach(function(fail) {
      log.unstamped(fail, 'yellow');
    });
  }
};

module.exports = Reporter;
