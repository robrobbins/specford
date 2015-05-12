var sys = require('system');
var colorizer = require('./colorizer');
var expand = require('./util').expand;

var Logger = function() {
  this.stamp = '[${time}] ${msg}';
  this.time = '${h}:${m}:${s}';
};

Logger.prototype.stamped = function(msg, style) {
  let data = {
    time: this.getTime(),
    msg: colorizer.color(msg, style)
  };
  console.log(expand(this.stamp, data));
};

Logger.prototype.unstamped = function(msg, style) {
  console.log(colorizer.color(msg, style));
};

// used for pass/fail (.,f) as not to newline each...
Logger.prototype.write = function(txt, style) {
  txt = colorizer.color(txt, style);
  sys.stdout.write(txt);
};

Logger.prototype.getTime = function() {
  let d = new Date();
  let h = d.getHours();
  let m = d.getMinutes();
  let s = d.getSeconds();
  let time = expand(this.time, {h:h, m:m, s:s});
  return  colorizer.color(time, 'gray');
};

Logger.prototype.pgOpening = function() {
  this.stamped('opening page...', 'gray');
};

Logger.prototype.pgOpened = function() {
  this.stamped('page opened.', 'gray');
};

module.exports = Logger;
