var expand = require('./util').expand;

var Reporter = require('./reporter');
var reporter = new Reporter;

// passed an instance of Dom by the rewriter
var Tester = function(dom) {
  this.dom = dom;

  this.failures = [];
  this.actuals = [];
  this.passes = 0;

  // failure messages for interpolation, TODO abstract
  this.noActual = " - ";
  this.doesntHaveText = '"${selector}" does not contain text "${ref}"';
  this.doesntHaveSelector = '"${selector}" does not contain selector "${ref}"';
  this.hasText = '"${selector}" contains text "${ref}"';
  this.hasSelector = '"${selector}" contains selector "${ref}"';
  this.urlDoesntContain = 'URL does not contain "${ref}"';
  this.urlDoesntMatch = 'URL does not match "${ref}"';
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

  reporter.summarize(this.elapsed, this.total(), this.failures, this.actuals);
};

Tester.prototype.result = function(data) {
  if (data.bool) {
    this.passes++;
    reporter.passed();
  } else {
    var txt = this.failed(data);
    this.failures.push(txt);
    // in order for the matrix to line-up push a placeholder of falsy
    this.pushActual(data);
    reporter.failed();
  }
};

// We need to see what was actually returned from the page thread in a fail
Tester.prototype.pushActual = function(data) {
  // at this point actual should be a string
  data.actual || (data.actual = this.noActual);
  this.actuals.push(expand('actual: ${actual}', data))
};

Tester.prototype.failed = function(data) {
  return expand(this[data.onFail], data);
};

Tester.prototype.textExists = function(selector, ref) {
  var text = this.dom.getTextBySelector(selector);
  var data = {
    bool: text.match(ref),
    selector: selector,
    ref: ref,
    onFail: 'doesntHaveText',
    actual: text
  };
  return this.result(data);
};

Tester.prototype.selectorExists = function(selector, ref) {
  var el = this.dom.getSelectorBySelector(selector, ref);
  var data = {
    bool: !!el,
    selector: selector,
    ref: ref,
    onFail: 'doesntHaveSelector'
  };
  return this.result(data);
};


Tester.prototype.textDoesNotExist = function(selector, ref) {
  var text = this.dom.getTextBySelector(selector);
  var data = {
    bool: !text.match(ref),
    selector: selector,
    ref: ref,
    onFail: 'hasText',
    actual: text
  };
  return this.result(data);
};

Tester.prototype.selectorDoesNotExist = function(selector, ref) {
  var el = this.dom.getSelectorBySelector(selector, ref);
  var data = {
    bool: !el,
    selector: selector,
    ref: ref,
    onFail: 'hasSelector'
  };
  return this.result(data);
};

Tester.prototype.urlContains = function(ref) {
  var url = this.dom.getUrl();
  var data = {
    bool: url.match(ref),
    ref: ref,
    onFail: 'urlDoesntContain',
    actual: url
  };
  return this.result(data);
};

Tester.prototype.urlMatches = function(ref) {
  var url = this.dom.getUrl();
  var data = {
    bool: url === ref,
    ref: ref,
    onFail: 'urlDoesntMatch',
    actual: url
  };
  return this.result(data);
};

module.exports = Tester;
