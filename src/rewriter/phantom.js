// Given the target grammar (for a specific test/spec framework)
// and an instruction set produce the strings needed to write the 
// temp files used by specford to test a crawled page

var $ = require('sudoclass'),
  // the grammar is a module
  // TODO make this an arg when new grammars are avail
  grammar = require('../grammar/phantom'),
  // grammar files dont need to explain language standards
  standards = require('../grammar/standards'),
  // delegate to the iterator to get ordered steps
  Iterator = require('../iterator'),

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
    var code = standards.header, steps = [],
      curr, visit, query, currentSelector, step, where;
    // only visits live at the top level of the inst set
    while((visit = instructions.shift())) {
      // reset per visit
      this.assertCount = 0;
      // place the timer start in the first 'step'
      this.assertions = [grammar.start];
      // bad if not a visit
      if(visit.shift() !== 'VISIT') {
        delegator.set('error', this.visitError);
        return;
      }
      // the page to be opened
      where = visit.shift();
      // now begin any number of top-level queries.
      // they may contain nested queries, that simply
      // stack or unstack selectors
      while((query = visit.shift())) {
        currentSelector = [];
        assertions = [];
        // bad if not a query
        if(query.shift() !== 'QUERY') {
          delegator.set('error', this.queryError);
          return;
        }
        currentSelector.push(query.shift());
        // now we should be left with [ID][ASSERT][REF]* or
        // another query that just stacks the selector
        // shift them out til they're gone
        while(query.length) {
          step = query.shift();
          // start digging
          this.assembleAssertions(step, query, currentSelector);
        }
      }
    }
    // each assertions index is the body for a 'step'.
    // wrap them in the step tmpl and keep in an array
    // the last will need the 'stop' lines appended
    for(curr; this.assertions.length && (curr = this.assertions.shift());) {
      if(!this.assertions.length) curr += grammar.stop.expand({num: this.assertCount});
      steps.push(grammar.step.expand({body: curr}));
    }
    code += grammar.page.expand({steps: steps, visit: where});
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
    // must have 3 parts

    // grab the next 2 items out of query, we now have all 3 pieces
    var assert = query.shift(),
    ref = query.shift(),
    curr = grammar[step[0]][assert[1]];
    // use the grammar to get the proper expansion
    switch(curr) {
      case 'selectorExists':
      case 'selectorDoesntExist':
        this.addsertion(grammar[curr].expand({
          selector: (selector.join(' ') + ' ' + ref[1])
        }));
        this.assertCount++;
        break;

      case 'selectorHasText':
      case 'selectorDoesntHaveText':
        this.addsertion(grammar[curr].expand({
          selector: selector.join(' '),
          text: ref[1]
        }));
        this.assertCount++;
        break;

      case 'urlMatches':
        this.addsertion(grammar[curr].expand({
          regex: ref[1]
        }));
        this.assertCount++;
        break;
      
      case 'clickLink':
        this.addsertion(grammar[curr].expand({
          selector: (selector.join(' ') + ' ' + ref[1])
        }));
        // push in a 'urlChanged' as the last entry of this step
        this.addsertion(grammar.onUrlChanged);
        // causes a new step to be started
        this.assertions.push('');
        break;

      case 'clickSelector':
        this.addsertion(grammar[curr].expand({
          selector: (selector.join(' ') + ' ' + ref[1])
        }));
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
  addsertion: function(assertion, collection) {
    collection || (collection = this.assertions);
    collection[collection.length - 1] += assertion;
  }
});

module.exports = Rewriter;
