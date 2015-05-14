var expand = require('./util').expand;

var Reporter = require('./reporter');
var reporter = new Reporter;

// passed an instance of Dom by the rewriter
var Tester = function(dom) {
  this.dom = dom;

  this.failures = [];
  this.passes = 0;

  // failure messages for interpolation
  this.doesntHaveText = '${selector} does not contain text "${ref}"';
  this.doesntHaveSelector = '${selector} does not contain selector "${ref}"';
  this.hasText = '${selector} contains text "${ref}"';
  this.hasSelector = '${selector} contains selector "${ref}"';
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
  return expand(this[data.onFail], data);
};

Tester.prototype.textExists = function(selector, ref) {
  var text = this.dom.getTextBySelector(selector);
  var data = {
    bool: text.match(ref),
    selector: selector,
    ref: ref,
    onFail: 'doesntHaveText'
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
    onFail: 'hasText'
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

module.exports = Tester;
