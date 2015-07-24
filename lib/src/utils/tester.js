/*
  TODO introduce a build step into the gulp compilation that allows
  undefined to remain, vs 'undefined'. This will allow the use of def args.
  Also, numbers (2 vs '2') so we can remove the check.
  dequotifier has a nice ring...
*/

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
  this.countIsNot = 'Count of ${selector} ${ref} is not ${q} ${num}';
  this.isNotVisible = '${selector} ${ref} is not visible';
  this.isVisible = '${selector} ${ref} is visible';
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
    return true;
  } else {
    // if in an after loop dont log the fails until timeout reached
    if (!this.waiting) {
      var txt = this.failed(data);
      this.failures.push(txt);
      this.pushActual(data);
      reporter.failed();
    }
    return false;
  }
};

Tester.prototype.after = function (next, test, ...testArgs) {
  // default timeout is 10s
  var tOut = 10000;
  var start = new Date().getTime();
  // condition to be met before proceeding
  var bool = false;
  var interval;

  interval = setInterval(function() {
    if ((new Date().getTime() - start < tOut) && !bool) {
      // flag the tests not to report while waiting
      this.waiting = true;
      // log that we are waiting
      reporter.waiting();
      // test in a method on this object...
      bool = this[test].apply(this, testArgs);
    } else {
      // regardless of pass / fail I am no longer waiting
      delete this.waiting;
      if (!bool) {
        // timeout or condition unmet
        reporter.afterFailed();
        // allow the fail to report
        this[test].apply(this, testArgs);
      }
      // the test must go on...
      clearInterval(interval);
      next();
    }
  }.bind(this), 500);
};

// We need to see what was actually returned from the page thread in a fail
Tester.prototype.pushActual = function(data) {
  // at this point actual should be a string
  data.actual || (data.actual = this.noActual);
  this.actuals.push(expand('actual: ${actual}', data));
};

Tester.prototype.failed = function(data) {
  return expand(this[data.onFail], data);
};

Tester.prototype.textExists = function(selector, ref) {
  selector || (selector = 'body');
  let text = this.dom.getTextBySelector(selector);
  let data = {
    bool: text.match(ref),
    selector: selector,
    ref: ref,
    onFail: 'doesntHaveText',
    actual: text
  };
  return this.result(data);
};

Tester.prototype.textDoesNotExist = function(selector, ref) {
  selector || (selector = 'body');
  let text = this.dom.getTextBySelector(selector);
  let data = {
    bool: !text.match(ref),
    selector: selector,
    ref: ref,
    onFail: 'hasText',
    actual: text
  };
  return this.result(data);
};

Tester.prototype.selectorExists = function(selector, ref) {
  selector || (selector = 'body');
  let el = this.dom.getSelectorBySelector(selector, ref);
  let data = {
    bool: !!el,
    selector: selector,
    ref: ref,
    onFail: 'doesntHaveSelector'
  };
  return this.result(data);
};

Tester.prototype.selectorDoesNotExist = function(selector, ref) {
  selector || (selector = 'body');
  let el = this.dom.getSelectorBySelector(selector, ref);
  let data = {
    bool: !el,
    selector: selector,
    ref: ref,
    onFail: 'hasSelector'
  };
  return this.result(data);
};

Tester.prototype.selectorIsVisible = function (selector, ref) {
  selector || (selector = 'body');
  let not = this.dom.selectorIsNotVisible(selector, ref);
  let data = {
    bool: !not,
    selector: selector,
    ref: ref,
    onFail: 'isNotVisible'
  };
  return this.result(data);
};

Tester.prototype.selectorIsNotVisible = function (selector, ref) {
  selector || (selector = 'body');
  let not = this.dom.selectorIsNotVisible(selector, ref);
  let data = {
    // the isDisayNone returns a bool...
    bool: not,
    selector: selector,
    ref: ref,
    onFail: 'isVisible'
  };
  return this.result(data);
};

Tester.prototype.urlContains = function(ref) {
  let url = this.dom.getUrl();
  let data = {
    bool: url.match(ref),
    ref: ref,
    onFail: 'urlDoesntContain',
    actual: url
  };
  return this.result(data);
};

Tester.prototype.urlMatches = function(ref) {
  let url = this.dom.getUrl();
  let data = {
    bool: url === ref,
    ref: ref,
    onFail: 'urlDoesntMatch',
    actual: url
  };
  return this.result(data);
};

Tester.prototype.countExists = function (selector, ref, num, q) {
  selector || (selector = 'body');
  // getSelectors... returns NodeList via querySelectorAll
  let list = this.dom.getSelectorsBySelector(selector, ref);
  let len = list.length;
  // assure that num is an int
  if (typeof num === 'string') num = parseInt(num, 10);
  // normalize the bool, q may be present (or not)
  let bool = q ? ( q === '>' ? len > num : len < num ) : len === num;

  let data = {
    bool: bool,
    selector: selector,
    ref: ref,
    num: num,
    q: q,
    onFail: 'countIsNot',
    actual: len
  };
  return this.result(data);
};

module.exports = Tester;
