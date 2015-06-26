var Logger = require('./logger');
var log = new Logger;
var expand = require('./util').expand;

var Reporter = function() {
  this.finished = '\nFinished ${total} assertions in ${elapsed}s';
  this.count = 'Failed: ${count}';
  this.afterFail = '"after" operation fail: condition unmet or timeout reached';
};

Reporter.prototype.passed = function() {
  log.write('.', 'greenBold');
};

Reporter.prototype.failed = function() {
  log.write('f', 'redBold');
};

Reporter.prototype.waiting = function() {
  log.stamped('waiting...', 'gray');
};

Reporter.prototype.afterFailed = function(msg) {
  log.stamped(this.afterFail, 'red');
};

Reporter.prototype.summarize = function(elapsed, total, failures, actuals) {
  elapsed = Math.floor(elapsed / 100) / 10;

  let info = expand(this.finished, { total: total, elapsed: elapsed });
  let failed = expand(this.count, { count: failures.length });

  log.unstamped(info, 'cyan');

  if (failures.length) {
    log.unstamped(failed, 'red');
    failures.forEach(function(fail, i) {
      log.unstamped(fail, 'yellow');
      log.unstamped(actuals[i], 'gray');
    });
  }
};

module.exports = Reporter;
