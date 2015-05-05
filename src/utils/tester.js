var util = require('./util');

var Reporter = require('./reporter');
var reporter = new Reporter;

var Tester = function(pg) {
  this.pg = pg;
  this.failures = [];
  this.passes = 0;

  // failure messages for interpolation
  this.doesntHaveText = '${selector} does not contain text "${ref}"';
  this.hasText = '${selector} contains text "${ref}"';
};

Tester.prototype.total = function() {
  return this.passes + this.failures.length;
};

Tester.prototype.start = function() {
  this.started = new Date().getTime();
};

Tester.prototype.stop = function() {
  this.stopped = new Date().getTime();
  this.elapsed = this.stopped - this.started;

  reporter.summarize(this.elapsed, this.total(), this.failures);
};

Tester.prototype.result = function(data) {
  if (data.bool) {
    this.passes++;
    reporter.passed();
  } else {
    var txt = this.failed(data);
    this.failures.push(txt);
    reporter.failed();
  }
};

Tester.prototype.failed = function(data) {
  return util.expand(this[data.onFail], data);
};

Tester.prototype.getTextBySelector = function(selector) {
  return pg.evaluate(function(s) {
    return document.querySelector(s).textContent;
  }, selector);
};

Tester.prototype.textExists = function(selector, ref) {
  var text = this.getTextBySelector(selector);
  var data = {
    bool: text.match(ref),
    selector: selector,
    ref: ref,
    onFail: 'doesntHaveText'
  };
  return this.result(data);
};

Tester.prototype.textDoesNotExist = function(selector, ref) {
  var text = this.getTextBySelector(selector);
  var data = {
    bool: !text.match(ref),
    selector: selector,
    ref: ref,
    onFail: 'hasText'
  };
  return this.result(data);
};

module.exports = Tester;
