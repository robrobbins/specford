// Given the target grammar (for a specific test/spec framework)
// and an instruction set produce the strings needed to write the 
// temp files used by specford to test a crawled page

var $ = require('sudoclass'),
  // the grammar is a module
  // TODO make this an arg when new grammars are avail
  grammar = require('../grammar/zombie'),
  // grammar files dont need to explain language standards
  standards = require('../grammar/standards'),
  // delegate to the iterator to get ordered steps
  Iterator = require('../iterator'),
  // all fixtures should be in this Object
  fixtures = require('../../fixtures/all.js'),

  Rewriter = function() {
    this.construct();

    this.visitError = 'Non-Visit block encountered where a Visit expected.';
    this.queryError = 'Non-Query block encountered where a Query expected.';

    this.addDelegate(new Iterator());
  };

Rewriter.prototype = $.extend(Object.create($.Base.prototype), {
  addedAsDelegate: function(delegator) {
    // observe the parsers tokens key and have the iterator
    // prepare those as an instruction set
    delegator.observe(this.getInstructionSet.bind(this));
  },
  // the value entered in the spec for a fill operation may be a fixture
  checkFill: function(fill) {
    return $.getPath(fill, fixtures) || fill;
  },
  // before we can begin to write the output for the tmp file
  // the iterator needs to organize the tokens
  getInstructionSet: function(change) {
    var instructions;
    if(change.name === 'tokens') {
      // easier to test this way
      instructions = this.delegate('iterator').makeInstructionSet(
        change.object.tokens);
      // we have our marching orders. do it soldier!
      this.rewrite(instructions);
    }
  },

  // continuing the string started by the require, 
  // build the content for the eventual script file
  rewrite: function(instructions) {
    var code = standards.header, pages = [], callbacks = [], stopped = false,
      curr, visit, query, currentSelector, step, where;
    // only visits live at the top level of the inst set
    while((visit = instructions.shift())) {
      // reset per visit
      this.assertCount = 0;
      this.waitCount = 0;
      // place the timer start in the first 'step'
      this.pages = [grammar.start];
      this.callbacks = [];
      // bad if not a visit
      if(visit.shift() !== 'VISIT') {
        this.delegator.set('error', this.visitError);
        return;
      }
      // the page to be opened
      where = visit.shift();
      // now begin any number of top-level queries.
      // they may contain nested queries, that simply
      // stack or unstack selectors
      while((query = visit.shift())) {
        currentSelector = [];
        // bad if not a query
        if(query.shift() !== 'QUERY') {
          this.delegator.set('error', this.queryError);
          return;
        }
        currentSelector.push(query.shift());
        // now we should be left with [step][two][three] or
        // another query that just stacks the selector
        // shift them out til they're gone
        while(query.length) {
          step = query.shift();
          // start digging
          this.assembleAssertions(step, query, currentSelector);
        }
      }
    }
    // if there are callbacks, the final block will need to contain the 'stop'
    for(curr; this.callbacks.length && (curr = this.callbacks.shift());) {
      if(!this.callbacks.length) {
        curr += grammar.stop.expand({num: this.assertCount});
        stopped = true;
      }
      // wrap each block in a standard function
      callbacks.push(standards.fn.expand({args: '', body: curr}));
    }
    // each pages index is the body for a 'page'.
    // wrap them in the page tmpl and keep in an array
    // the last will need the 'stop' lines appended if not in a callback
    for(curr; this.pages.length && (curr = this.pages.shift());) {
      if(!this.pages.length && !stopped) curr += grammar.stop.expand({num: this.assertCount});
      pages.push(grammar.page.expand({body: curr}));
    }
    // callbacks and pages
    code += grammar.vars.expand({
      callbacks: callbacks.join(','),
      pages: pages.join(','),
      visit: where
    });
    this.delegator.set('code', code);
  },

  recurseQuery: function(step, selector) {
    // dont muddle selectors out of your scope
    var mySelector = [].concat(selector);
    // the step is another query in this case, pitch the ID
    step.shift();
    // scope it
    mySelector.push(step.shift());
    // iterate through either assembling assertions
    // or recursing more queries
    return this.assembleAssertions(step.shift(), step, mySelector);
  },

  assembleAssertions: function(step, query, selector) {
    // if a query recurse it
    if(step[0] === 'QUERY') {
      return this.recurseQuery(step, selector);
    }
    // a non-query ready to be expanded into an assertion
    // must have 3 parts [step, two, three]

    // grab the next 2 items out of query, we now have all 3 pieces
    // plus a 'non-terminal' grammar step
    var two = query.shift(),
    three = query.shift(), nt;
    // fill syntax
    if(step[0] in grammar.twoRefs) nt = grammar[step[0]];
    else if (step[0] in grammar.reversed) nt = grammar[step[0]][two[1]];
    else nt = grammar[step[0]][three[1]];
    // use the grammar to get the proper expansion
    switch(nt) {
      case 'selectorExists':
      case 'selectorDoesNotExist':
        this.addsertion(grammar[nt].expand({
          selector: (selector.join(' ') + ' ' + two[1])
        }));
        this.assertCount++;
        break;

      case 'selectorHasText':
      case 'selectorDoesNotHaveText':
        this.addsertion(grammar[nt].expand({
          selector: selector.join(' '),
          text: two[1]
        }));
        this.assertCount++;
        break;

      case 'clickLink':
      case 'clickSubmit':
        // these instructions will go in that callback
        this.addsertion(grammar[nt].expand({
          selector: (selector.join(' ') + ' ' + three[1])
        }));
        // causes a new callback block to be started
        this.callbacks.push('');
        break;

      case 'clickSelector':
        this.addsertion(grammar[nt].expand({
          selector: (selector.join(' ') + ' ' + three[1])
        }));
        this.callbacks.push('');
        break;

      case 'fillSelector':
        this.addsertion(grammar[nt].expand({
          selector: (selector.join(' ') + ' ' + two[1]),
          value: this.checkFill(three[1])
        }));
        this.callbacks.push('');
        break;
        
      case 'waitFor':
        break;

      case 'urlMatches':
        this.addsertion(grammar[nt].expand({
          regex: three[1]
        }));
        this.assertCount++;
        break;

      default:
        break;
    }
    // if theres more, keep going
    if(query.length) return this.assembleAssertions(query.shift(), query, selector);
    else return;
  },

  role: 'rewriter',

  // yeah thats right. Addsertion.
  addsertion: function(assertion) {
    if (this.callbacks.length) {
      this.callbacks[this.callbacks.length - 1] += assertion;
    } else this.pages[this.pages.length - 1] += assertion;
  }
});

module.exports = Rewriter;
