var fs = require('fs'), colorizer = require('./colorizer');

module.exports =  {
  click: function(selector) {
    page.evaluate(function(s) {
      var ev = document.createEvent("MouseEvents");
      ev.initMouseEvent('click', true, true);
      document.querySelector(s).dispatchEvent(ev);
    }, selector);
  },

  execute: function(js) {
    page.evaluateJavaScript(js);
  },

  fail: {
    doesntHaveText: function(selector, ref) {
      return selector + ' contains text "' + ref + '".';
    },
    doesntExist: function(selector) {
      return selector + ' exists.';
    },
    exists: function(selector) {
      return selector + ' does not exist.';
    },
    hasText: function(selector, ref) {
      return selector + ' does not contain text "' + ref + '".';
    },
    urlMatches: function(regex) {
      return 'Current URL does not match ' + regex;
    },
    waitFor: function(msg) {
      return 'Wait for "' + msg + '" timed out';
    }
  },

  failures: [],

  fillSelector: function(selector, value) {
    page.evaluate(function(obj) {
      document.querySelector(obj.selector).value = obj.value;
    }, {selector: selector, value: value});
  },

  getTextBySelector: function(selector) {
    return page.evaluate(function(s) {
      return document.querySelector(s).textContent;
    }, selector);
  },

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

  selectorDoesntHaveText: function(selector, ref, waiting) {
    var text = this.getTextBySelector(selector);
    return waiting ? !text.match(ref) :
      this.run(!text.match(ref), selector, ref, 'doesntHaveText');
  },

  selectorDoesntExist: function(selector, waiting) {
    var res = page.evaluate(function(s) {
      return document.querySelector(s);
    }, selector);

    return waiting ? !res : this.run(!res, selector, null, 'doesntExist');
  },

  selectorExists: function(selector, waiting) {
    var res = page.evaluate(function(s) {
      return document.querySelector(s);
    }, selector);

    return waiting ? res : this.run(res, selector, null, 'exists');
  },

  // if waiting, return the basic test not the run
  selectorHasText: function(selector, ref, waiting) {
    var text = this.getTextBySelector(selector);
    return waiting ? text.match(ref) : 
      this.run(text.match(ref), selector, ref, 'hasText');
  },

  start: function(t) {
    this.started = t;
  },

  stop: function(t) {
    this.time = t - this.started;
  },

  submitSelector: function(selector) {
    page.evaluate(function(s) {
      document.querySelector(s).submit();
    }, selector);
  },

  urlMatches: function(regex) {
    var url = page.evaluate(function(){return window.location.href;});
    return this.run(url.match(regex), regex, null, 'urlMatches');
  },

  waitFor: function(predicate, continues, msg) {
    var toMs = 3000, start = new Date().getTime(), condition = false,
      interval = setInterval(function() {
        if((new Date().getTime() - start < toMs) && !condition) {
          condition = predicate();
        } else {
          clearInterval(interval);
          test.run(condition, msg, null, 'waitFor');
          continues();
        }
      }, 250);
  },

  write: function(what) {
    fs.write('/dev/stdout', what, 'w');
  }
};
