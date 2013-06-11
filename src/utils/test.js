var fs = require('fs'), colorizer = require('./colorizer');

module.exports =  {
  click: function(selector) {
    page.evaluate(function(s) {
      var ev = document.createEvent("MouseEvents");
      ev.initMouseEvent('click', true, true);
      document.querySelector(s).dispatchEvent(ev);
    }, selector);
  },

  fail: {
    doesntHaveText: function(selector, ref) {
      return selector + ' contains text "' + ref + '".';
    },
    exists: function(selector) {
      return selector + ' exists.';
    },
    hasText: function(selector, ref) {
      return selector + ' does not contain text "' + ref + '".';
    },
    urlMatches: function(regex) {
      return 'Current URL does not match ' + regex;
    }
  },

  failures: [],

  getTextBySelector: function(selector) {
    return page.evaluate(function(s) {
      return document.querySelector(s).textContent;
    }, selector);
  },

  //passes: 0,
  
  report: function(num) {
    var elapsed = Math.floor(this.time / 100) / 10,
      info = colorizer.colorize("\nFinished: " + num + ' assertions in ' + elapsed + 's', 'greenBar', 50),
      //passed = colorizer.colorize('Passed: ' + this.passes, 'greenBar', 24),
      failed = colorizer.colorize('Failed: ' + this.failures.length, 'redBar', 49);
    console.log(info);
    //this.write(passed);
    if(this.failures.length) {
      console.log(failed);
      this.failures.forEach(function(fail) {
        console.log(colorizer.colorize(fail, 'error'));
      });
    }
  },

  run: function(res, selector, ref, caller) {
    if(res) {
      this.write(colorizer.colorize('.', 'info'));
      //this.passes++;
    } else {
      this.write(colorizer.colorize('f', 'error'));
      this.failures.push(this.fail[caller](selector, ref));
    }
  },

  selectorDoesntHaveText: function(selector, ref) {
    var text = this.getTextBySelector(selector);
    return this.run(!text.match(ref), selector, ref, 'doesntHaveText');   
  },

  selectorExists: function(selector) {
    var res = page.evaluate(function(s) {
      return document.querySelector(s);
    }, selector);

    return this.run(res, selector, null, 'exists');
  },

  selectorHasText: function(selector, ref) {
    var text = this.getTextBySelector(selector);
    return this.run(text.match(ref), selector, ref, 'hasText');
  },

  start: function(t) {
    this.started = t;
  },

  stop: function(t) {
    this.time = t - this.started;
  },

  urlMatches: function(url, regex) {
    return this.run(url.match(regex), regex, null, 'urlMatches');
  },

  write: function(what) {
    fs.write('/dev/stdout', what, 'w');
  }
};
