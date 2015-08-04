var grammar = require('../grammar/slimer');
var expand = require('../utils/util').expand;

/*
  Iterator + Grammar = code;
*/
class Rewriter {
  constructor() {
    this.requires = [];
    this.code = [];
    this.steps = [];
    this.step = [];
    // when a step is ready to be moved, it must be wrapped...
    this.stepWrapper = 'openWrapper';
    // visits after the first are just steps...
    this.visits = 0;
    // some single ref observations have their ref last (3rd vs 2nd)
    this.refLast = ['URL'];
  }

  startCodeBlock() {
    this.code.push(
      grammar.header,
      grammar.pgNull,
      grammar.dom,
      grammar.tester,
      grammar.colorizer,
      grammar.logger
    );
  }

  getElse() {
    let obj = grammar.pgElse;
    let ary = [
      obj.create,
      obj.ref,
      obj.viewport,
      obj.console,
      obj.nav,
      obj.error
    ];
    return expand(obj.wrapper, { body: ary.join('') });
  }

  pushVisitBlock() {
    // first assemble the lengthy pgElse block
    let ary = [
      grammar.pgIf,
      this.getElse(),
      grammar.logOpening,
      grammar.pgOpen
    ];
    let str = expand(grammar.visitFn, { body: ary.join('') });
    this.code.push(str);
  }

  pushVisit() {
    this.code.push(expand(grammar.visitCall, { url: this.initialVisit }));
  }

  pushStepsBlock() {
    let str = expand(grammar.steps, { steps: this.steps.join(',') });
    this.code.push(str);
  }

  // move a finished step into the steps and clear it
  moveStep() {
    let str = expand(grammar[this.stepWrapper],
      { body: this.step.join('') });

    this.steps.push(str);
    this.step = [];
  }

  // inspect the token and call the appropriate method(s)
  handleItem(item) {
    switch (item.tokens[0][0]) {
      case 'REQUIRE':
        this.handleRequire(item);
        break;

      case 'VISIT':
        this.handleVisit(item.tokens[0][1]);
        break;

      // queries do nothing here
      case 'QUERY':
        let pass;
        break;

      case 'AFTER':
        this.handleAfter(item);
        break;

      case 'CAPTURE':
        this.handleCapture(item);
        break;

      case 'CLICK':
        this.handleCommand(item);
        break;

      case 'SELECT':
        this.handleCommand(item);
        break;

      case 'FILL':
        this.handleCommand(item, {isFill: true});
        break;

      // observations are the default
      default:
        this.handleObservation(item);
        break;
    }
  }

  handleRequire(item) {
    let str = grammar.REQUIRE;
    let data = { fixture: item.tokens[2][1], path: item.tokens[1][1]};
    this.requires.push(expand(str, data));
  }

  handleVisit(url) {
    // if step is present move it to steps
    if (this.visits > 0) {
      // TODO handle nth visit
    } else {
      this.step.push(grammar.logOpened, grammar.start);
      this.initialVisit = url;
      this.visits++;
    }
  }

  // test.after(steps.shift(), method, one, two, three, four)
  // we will cap the allowed number of args to all methods at 4
  // we, obviously, cannot pass a complex structure...
  handleAfter(item) {
    // shift off the after token, leaving a triplet
    item.tokens.shift();
    let str = grammar.AFTER;
    let data = {};
    // top-level of the grammar objects we are dealing with
    let subject = item.tokens[0][0];
    // special grammar cases
    let isUrl = subject === 'URL';
    let isNum = subject === 'NUMBER';
    // an after call can only happen on observations, of which URL varies
    if (isUrl) {
      data.meth = grammar[item.tokens[0][0]][item.tokens[1][1]].after;
      // url has no selector
      data.one = item.tokens[2][1];
      data.two = undefined;
    }
    // or, a base observation (number case applies here)
    else {
      data.meth = grammar[item.tokens[0][0]][item.tokens[2][1]].after;
      // typical selector, ref argument pair
      data.one = item.selector;
      data.two = item.tokens[1][1];
      // number case has 2 more args
      if (isNum) {
        // here the value of the inital refinement (subject)
        data.three = item.tokens[0][1];
        data.four = item.quantifier;
      }
    }
    this.step.push(expand(str, data));
    // the current step is done
    this.moveStep();
    // the next steps will be wrapped in a generic fn
    this.stepWrapper = 'genericWrapper';
  }

  handleCapture(item) {
    let str = grammar.CAPTURE;
    let data = { name: item.tokens[2][1], ext: item.tokens[1][1]};
    this.step.push(expand(str, data));
  }

  handleUrl(item) {
    let str = grammar.URL[item.tokens[1][1]].now;
    let data = { ref: item.tokens[2][1] };
    this.step.push(expand(str, data));
  }

  handleCommand(item, opts) {
    let isFill = opts && opts.isFill;
    let data = { selector: item.selector };
    let str;
    // fill commands are FILL/REF/REF  OR FILL/REF/ID with the 1th ref being a sel, the last a val
    if (isFill) {
      // can be either from a string or require reference, hence the xtra refinement
      str = grammar[item.tokens[0][0]][item.tokens[2][0]];
      data.ref = item.tokens[1][1];
      data.val = item.tokens[2][1];
      // non-fill command has no val
    } else {
      str = grammar[item.tokens[0][0]];
      data.ref = item.tokens[2][1];
    }

    this.step.push(expand(str, data));
  }

  handleObservation(item) {
    // selector -> queryStack (managed by the iterator)
    let data = { selector: item.selector};
    // top-level of the grammar objects we are dealing with
    let subject = item.tokens[0][0];
    // ref-at-the-end case?
    let isLast = ~this.refLast.indexOf(subject);
    // where is my ref then?
    let refIndex = isLast ? 2 : 1;
    // so then my grammar method is at...
    let methIndex = (3 - refIndex);
    // all observations have immediate + after use-case
    let str = grammar[subject][item.tokens[methIndex][1]].now;
    data.ref = item.tokens[refIndex][1];
    // some methods will use the subject token value (number for ex...)
    data.subject = item.tokens[0][1];
    // NUMBER cases may have a quantifer attr (>, <). The NUMBER token is 0th
    data.q = item.tokens[0].quantifier;

    this.step.push(expand(str, data));
  }

  rewrite(iterator) {
    this.startCodeBlock();

    for (let item of iterator) {
      this.handleItem(item);
    }

    // the requires go in now
    this.code.push(this.requires.join(''));

    // each token set inspected, close the last step
    this.step.push(grammar.stop, grammar.exit);
    // done with steps
    this.moveStep();
    this.pushStepsBlock();

    this.pushVisitBlock();
    this.pushVisit();

    return this.code.join('');
  }
}

module.exports = Rewriter;
