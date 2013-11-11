var colorizer = require('./colorizer');

module.exports =  {
  fail: {
    doesNotHaveText: function(selector, ref) {
      return selector + ' contains text "' + ref + '".';
    },
    doesNotExist: function(selector) {
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

  getTextBySelector: function(selector) {
    return this.browser.query(selector).textContent;
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

  selectorDoesNotHaveText: function(selector, ref) {
    var text = this.getTextBySelector(selector);
    return this.run(!text.match(ref), selector, ref, 'doesNotHaveText');
  },
  
  selectorDoesNotExist: function(selector) {
    var res = this.browser.query(selector);
    return this.run(!res, selector, null, 'doesNotExist');
  },

  selectorExists: function(selector) {
    var res = this.browser.query(selector);
    return this.run(res, selector, null, 'exists');
  },

  // if waiting, return the basic test not the run
  selectorHasText: function(selector, ref) {
    var text = this.getTextBySelector(selector);
    return this.run(text.match(ref), selector, ref, 'hasText');
  },
  
  setBrowserRef: function(browser) {
    this.browser = browser;
  },

  start: function(t) {
    this.started = t;
  },

  stop: function(t) {
    this.time = t - this.started;
  },

  urlMatches: function(regex) {
    var url = this.browser.window.location.href;
    return this.run(url.match(regex), regex, null, 'urlMatches');
  },

  waitFor: function() {},

  write: function(what) {
    process.stdout.write(what);
  }
};
