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
  // all fixtures should be in this Object
  fixtures = require('../../fixtures/all.js');

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
    var code = standards.header, pages = [], continues = [], stopped = false,
      curr, visit, query, currentSelector, step, where;
    // only visits live at the top level of the inst set
    while((visit = instructions.shift())) {
      // reset per visit
      this.assertCount = 0;
      this.waitCount = 0;
      // place the timer start in the first 'step'
      this.pages = [grammar.start];
      this.predicates = [];
      this.continues = [];
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
        // bad if not a query
        if(query.shift() !== 'QUERY') {
          delegator.set('error', this.queryError);
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
    // if there are continues, the final block will need to contain the 'stop'
    for(curr; this.continues.length && (curr = this.continues.shift());) {
      if(!this.continues.length) {
        curr += grammar.stop.expand({num: this.assertCount});
        stopped = true;
      }
      // wrap each block in a standard function
      continues.push(standards.fn.expand({args: '', body: curr}));
    }
    // each pages index is the body for a 'page'.
    // wrap them in the page tmpl and keep in an array
    // the last will need the 'stop' lines appended if not in a continues
    for(curr; this.pages.length && (curr = this.pages.shift());) {
      if(!this.pages.length && !stopped) curr += grammar.stop.expand({num: this.assertCount});
      pages.push(grammar.page.expand({body: curr}));
    }
    // predicates, continues and pages
    code += grammar.vars.expand({
      predicates: this.predicates.join(','),
      continues: continues.join(','),
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
    // `fill` has a slightly diff syntax
    if(step[0] in grammar.twoRefs) {
      // assert and ref are refs
      nt = grammar[step[0]];
    } else nt = grammar[step[0]][two[1]];
    // use the grammar to get the proper expansion
    switch(nt) {
      case 'selectorExists':
      case 'selectorDoesntExist':
        this.addsertion(grammar[nt].expand({
          selector: (selector.join(' ') + ' ' + three[1]),
          waiting: !!this.isPredicate
        }));
        this.assertCount++;
        break;

      case 'selectorHasText':
      case 'selectorDoesntHaveText':
        this.addsertion(grammar[nt].expand({
          selector: selector.join(' '),
          text: three[1],
          waiting: !!this.isPredicate
        }));
        this.assertCount++;
        break;

      case 'clickLink':
      case 'clickSubmit':
        this.addsertion(grammar[nt].expand({
          selector: (selector.join(' ') + ' ' + three[1])
        }));
        // push in a 'urlChanged' as the last entry of this step
        this.addsertion(grammar.onUrlChanged);
        // causes a new block to be started, on a new phantom page
        this.pages.push('');
        break;

      case 'clickSelector':
        this.addsertion(grammar[nt].expand({
          selector: (selector.join(' ') + ' ' + three[1])
        }));
        break;

      case 'fillSelector':
        this.addsertion(grammar[nt].expand({
          selector: (selector.join(' ') + ' ' + two[1]),
          value: this.checkFill(three[1])
        }));
        break;

      case 'submitSelector':
        this.addsertion(grammar[nt].expand({
          selector: (selector.join(' ') + ' ' + three[1])
        }));
        // url will change
        this.addsertion(grammar.onUrlChanged);
        // starts a new phantom page
        this.pages.push('');
        break;

      case 'waitFor':
        // the next (non-query) will be a predicate Followed by 
        // statements that need to go in a continues
        this.addsertion(grammar.waitFor.expand({
          count: this.waitCount,
          msg: three[1]
        }));
        this.isPredicate = true;
        // 'prime the contiues block'
        this.continues.push('');
        this.waitCount++;
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
  addsertion: function(assertion, collection) {
    // the collection ta add to depends on the state of the test
    if(!collection) {
      if(this.isPredicate) {
        // predicates do not stack, but need to be wrapped in an expression
        assertion = standards.expression.expand({args: '', body: assertion});
        this.predicates.push(assertion);
        this.isPredicate = false;
        // the next series of assertions will go in a continues block
        this.isContinues = true;
      } else if (this.isContinues) {
        this.continues[this.continues.length - 1] += assertion;
      } else this.pages[this.pages.length - 1] += assertion;
    } else collection[collection.length - 1] += assertion;
  }
});

module.exports = Rewriter;
