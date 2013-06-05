// Given the target grammer (for a specific test/spec framework)
// and an instruction set produce the strings needed to write the 
// temp files used by specford to test a crawled page

var $ = require('sudoclass'),
  // the grammer is a module
  // TODO make this an arg when new grammers are avail
  grammer = require('./grammer/casper'),
  // grammer files dont need to explain language standards
  standards = require('./grammer/standards'),
  // delegate to the iterator to get ordered steps
  Iterator = require('./iterator'),

  Rewriter = function() {
    this.construct();

    this.visitError = 'Non-Visit block encountered where a Visit expected.';
    this.queryError = 'Non-Query block encountered where a Query expected.';
    

    this.addDelegate(new Iterator());
  };

Rewriter.prototype = Object.extend(Object.create($.Base.prototype), {
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
    var code = standards.header + grammer.require,
      fn, visit, query, currentSelector, step, run, runBody;
    // only visits live at the top level of the inst set
    while((visit = instructions.shift())) {
      // reset per visit
      this.assertCount = 0;
      this.assertions = [''];
      // bad if not a visit
      if(visit.shift() !== 'VISIT') {
        delegator.set('error', this.visitError);
        return;
      }
      // always starts here
      code += grammer.start.expand({where: visit.shift()});
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
    // each item in the assertions array represents a then block
    this.assertions.forEach(function(block) {
      code += this.thenBlock(block);
    }.bind(this));
    // create the run statement
    runBody = grammer.done.expand({num: this.assertCount}) + 
      grammer.renderResults.expand({bool: true});

    run = standards.fn.expand({
      args: '',
      body: runBody,
      nfe: 'run',
      terminator: ''
    });

    code += grammer.run.expand({fn: run});
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
    var assert, ref, curr, mySelector;
    // a non-query ready to be expanded into an assertion
    // most have 3 parts, but some have 2
    if(step[0] in grammer.noAssert) {
      // should be the last item in a then block
      // as the world may change
    } else {
      // grab the next 2 items out of query, we now have all 3 pieces
      assert = query.shift();
      ref = query.shift();
      curr = grammer[step[0]][assert[1]];
      // use the grammer to get the proper expansion
      switch(curr) {
        case 'assertSelectorExists':
        case 'assertSelectorDoesntExist':
          this.assertions[this.assertions.length - 1] += grammer[curr].expand({
            selector: (selector.join(' ') + ' ' + ref[1])
          });
          this.assertCount++;
          break;

        case 'assertSelectorHasText':
        case 'assertSelectorDoesntHaveText':
          this.assertions[this.assertions.length - 1] += grammer[curr].expand({
            selector: selector.join(' '),
            text: ref[1]
          });
          this.assertCount++;
          break;
        
        default:
          break;
      }
    }
    // if theres more, keep going
    if(query.length) return this.assembleAssertions(query.shift(), query, selector);
    else return;
  },

  role: 'rewriter',

  // take any number of assertions and wrap them in 'then' block
  thenBlock: function(assertions) {
    var fn;
    // wrap the assertions in an anonymous fn
    fn = standards.fn.expand({
      args: '',
      body: assertions,
      nfe: 'then',
      terminator: ''
    });
    // wrap that fn in a then statement, adding it to the code
    return grammer.then.expand({fn: fn});
  }

});

module.exports = Rewriter;
