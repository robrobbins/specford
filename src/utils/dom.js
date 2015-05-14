var Dom = function() {};

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
    let ev = document.createEvent("MouseEvents");
    ev.initMouseEvent('click', true, true, window, null, 0, 0, 0, 0, false,
      false, false, false, 0, null);

    return el && el.dispatchEvent(ev);
  }, selector, ref);
};

// TODO support filling multiple via querySelectorAll?
Dom.prototype.fillSelector = function(selector, ref, val) {
  this.pg.evaluate((s, r, v) => {
    let el = document.querySelector(s).querySelector(r);
    if (el) el.value = v;
  }, selector, ref, val);
};

module.exports = Dom;
