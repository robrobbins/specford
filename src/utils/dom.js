var Dom = function() {

};

// Dom needs the currently opened page from the env
Dom.prototype.setPageRef = function(pg) { this.pg = pg; };

Dom.prototype.getTextBySelector = function(selector) {
  return this.pg.evaluate((s) => {
    return document.querySelector(s).textContent;
  }, selector);
};

Dom.prototype.getSelectorBySelector = function(selector, ref) {
  return this.pg.evaluate((s, r) => {
    let el = document.querySelector(s);
    return el && el.querySelector(r);
  }, selector, ref);
};

Dom.prototype.clickSelector = function(selector, ref) {
  this.pg.evaluate((s, r) => {
    let el = document.querySelector(s).querySelector(r);
    let ev = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
    el && el.dispatchEvent(ev);
  }, selector, ref);
};

// TODO deny filling disabled or readonly? Log message?
// TODO when filling, fire input on each char?
Dom.prototype.fillSelector = function(selector, ref, val) {
  this.pg.evaluate((s, r, v) => {
    let el = document.querySelector(s).querySelector(r);
    if (el) {
      el.value = v;
      // trigger an `input` event on appropriate types
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        let ev = new Event('input', { bubbles: true, cancelable: false });
        el.dispatchEvent(ev);
      }
    }
  }, selector, ref, val);
};

module.exports = Dom;
