var generics = require('../grammar/generics');
var grammar = require('../grammar/slimer');
var expand = require('../utils/util').expand;

/*
  Iterator + Grammar = code;
*/
class Rewriter {
  constructor() {
    this.code = [];
    this.steps = [];
    this.step = [];
    this.stepWrapper = 'openWrapper';
    this.visits = 0;
  }

  startCodeBlock() {
    this.code.push(
      generics.header,
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

  handleClick(item) {
    let str = grammar.CLICK[item.tokens[1][1]];
    let data = { selector: item.selector, ref: item.tokens[2][1] };
    this.step.push(expand(str, data));
  }

  handleFill(item) {
    // the cadence technically is FILL/ref/ref with the 1th ref being a sel
    let str = grammar.FILL.selector;
    let data = { selector: item.selector, ref: item.tokens[1][1], val: item.tokens[2][1] };
    this.step.push(expand(str, data));
  }

  handleAfter(item) {
    if (item.tokens[1][0] === 'URL') {
      // we assume the listener needs to go next-to-last in the current step
      let str = grammar.AFTER.url.change;
      var last = this.step.pop();
      this.step.push(str, last);
      // the current step is now done
      this.moveStep();
      // the next steps will be wrapped in a 'urlChange'
      this.stepWrapper = 'urlChangeWrapper';
    }
  }

  // the default handler for cadence-of-3
  handleAssert(item) {
    let str = grammar[item.tokens[0][0]][item.tokens[2][1]];
    let data = { selector: item.selector, ref: item.tokens[1][1] };
    this.step.push(expand(str, data));
  }

  rewrite(iterator) {
    this.startCodeBlock();

    for (let item of iterator) {
      switch (item.tokens[0][0]) {
        case 'VISIT':
          this.handleVisit(item.tokens[0][1]);
          break;

        // queries do nothing here
        case 'QUERY':
          let pass;
          break;

        case 'CLICK':
          this.handleClick(item);
          break;

        case 'AFTER':
          this.handleAfter(item);
          break;

        case 'FILL':
          this.handleFill(item);
          break;

        // default is our 3-command triplet where assert is last
        default:
          this.handleAssert(item);
          break;
      }
    }

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
