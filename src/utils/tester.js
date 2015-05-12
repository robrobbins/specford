var expand = require('./util').expand;

var Reporter = require('./reporter');
var reporter = new Reporter;

var Tester = function() {
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

Tester.prototype.getTextBySelector = function(selector) {
  return this.pg.evaluate((s) => {
    return document.querySelector(s).textContent;
  }, selector);
};

Tester.prototype.getSelectorBySelector = function(selector, ref) {
  return this.pg.evaluate((s, r) => {
    let el = document.querySelector(s);
    return el && el.querySelector(r);
  }, selector, ref);
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

Tester.prototype.selectorExists = function(selector, ref) {
  var el = this.getSelectorBySelector(selector, ref);
  var data = {
    bool: !!el,
    selector: selector,
    ref: ref,
    onFail: 'doesntHaveSelector'
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

Tester.prototype.selectorDoesNotExist = function(selector, ref) {
  var el = this.getSelectorBySelector(selector, ref);
  var data = {
    bool: !el,
    selector: selector,
    ref: ref,
    onFail: 'hasSelector'
  };
  return this.result(data);
};

Tester.prototype.clickSelector = function(selector, ref) {
  this.pg.evaluate((s, r) => {
    let el = document.querySelector(s).querySelector(r);
    let ev = document.createEvent("MouseEvents");
    ev.initMouseEvent('click', true, true, window, null, 0, 0, 0, 0, false,
      false, false, false, 0, null);

    return el && el.dispatchEvent(ev);
  }, selector, ref);
};

// TODO support filling multiple via querySelectorAll?
Tester.prototype.fillSelector = function(selector, ref, val) {
  this.pg.evaluate((s, r, v) => {
    let el = document.querySelector(s).querySelector(r);
    if (el) el.value = v;
  }, selector, ref, val);
};

// Our react components will need change dispatched on them after being filled
Tester.prototype.fireChange = function(selector, ref) {
  this.pg.evaluate((s, r) => {
    let el = document.querySelector(s).querySelector(r);
    let ev = document.createEvent("HTMLEvents");
    ev.initEvent('change', false, true);

    return el && el.dispatchEvent(ev);
  }, selector, ref);
};

module.exports = Tester;
