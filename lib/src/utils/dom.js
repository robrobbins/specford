var Dom = function() {
// TODO make default selector configurable by taking an arg here?
// i.e -> this.defSel = arg || 'body'
};

// Dom needs the currently opened page from the env
Dom.prototype.setPageRef = function(pg) { this.pg = pg; };

Dom.prototype.getTextBySelector = function(selector) {
  return this.pg.evaluate((s) => {
    let el = document.querySelector(s);
    if (!el) console.log("DOM failue: Cannot find %s", s);
    return el && el.textContent;
  }, selector || 'body');
};

// the optional third arg, _all, is internally used to trigger a QSA vs QS
Dom.prototype.getSelectorBySelector = function(selector, ref, _all) {
  return this.pg.evaluate((s, r, _a) => {
    // s is never QSA as it must be a singular result
    let el = document.querySelector(s);
    if (!el) console.log("DOM failure: Cannot find %s", s);
    let ell = _a ? (el && el.querySelectorAll(r)) : (el && el.querySelector(r));
    // there will not be a falsy case in _all scenarios, works out fine...
    if (!ell) console.log("DOM failure: Cannot find %s within %s", r, s);
    return ell;
  }, selector || 'body', ref, _all);
};

// facade for instructing GSBS to use QSA.
Dom.prototype.getSelectorsBySelector = function (selector, ref) {
  return this.getSelectorBySelector(selector, ref, true);
};

Dom.prototype.selectorIsNotVisible = function (selector, ref) {
  let el = this.getSelectorBySelector(selector, ref);
  // there can be 2 cases that indicate 'none'
  let display = el.style && el.style.display;
  if (display === 'none') return true;
  // we count visibility:hidden as not visible
  let viz = el.style && el.style.visibility;
  if (viz === 'hidden') return true;
  // computed in css sheet case
  let comp = getComputedStyle(el);
  display = comp.display;
  if (display === 'none') return true;
  viz = comp.visibility;
  if (viz === 'hidden') return true;
  return false;
};

Dom.prototype.selectorIsSelected = function(selector, ref) {
  let el = this.getSelectorBySelector(selector, ref);
  // <option>
  if (el && el.selected) return true;
  // <radio>, <checkbox>
  if (el && el.checked) return true;
  return false;
};

Dom.prototype.getUrl = function() {
  return this.pg.evaluate(() => {
    return window.location.href;
  });
};

// TODO what about disabled?
Dom.prototype.selectSelector = function(selector, ref) {
  let el = this.getSelectorBySelector(selector, ref);
  // <option>
  if (el && el.tagName === 'OPTION') el.selected = true;
  // <radio>, <checkbox>
  if (el && (el.type === 'checkbox' || el.type === 'radio')) el.checked = true;
  return false;
};

Dom.prototype.clickSelector = function(selector, ref) {
  this.pg.evaluate((s, r) => {
    let el = document.querySelector(s);
    if (!el) console.log("DOM failure: Cannot find %s", s);
    let ell = el.querySelector(r);
    if (!ell) console.log("DOM failure: Cannot find %s within %s", r, s);
    let ev = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
    ell && ell.dispatchEvent(ev);
  }, selector || 'body', ref);
};

// TODO deny filling disabled or readonly? Log message?
// TODO when filling, fire input on each char?
Dom.prototype.fillSelector = function(selector, ref, val) {
  this.pg.evaluate((s, r, v) => {
    let el = document.querySelector(s);
    if (!el) console.log("DOM failure: Cannot find %s", s);
    let ell = el.querySelector(r);
    if (!ell) console.log("DOM failure: Cannot find %s within %s", r, s);
    if (ell) {
      ell.value = v;
      // trigger an `input` event on appropriate types
      if (ell.tagName === 'INPUT' || ell.tagName === 'TEXTAREA') {
        let ev = new Event('input', { bubbles: true, cancelable: false });
        ell.dispatchEvent(ev);
      }
    }
  }, selector || 'body', ref, val);
};

module.exports = Dom;
