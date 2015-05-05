var generics = require('../grammar/generics');
var grammar = require('../grammar/phantom');
var util = require('../utils/util');

/*
  Iterator + Grammar = code;
*/
class Rewriter {
  constructor() {
    this.code = [];
    this.steps = [];
    this.step = [];
  }

  startCodeBlock() {
    this.code.push(
      generics.header,
      grammar.pgNull,
      grammar.tester,
      grammar.test
    );
  }

  pushVisitBlock() {
    let ary = [
      grammar.pgIf,
      grammar.pgElse,
      grammar.pgOpen
    ];
    let str = util.expand(grammar.visitFn, { body: ary.join('') });
    this.code.push(str);
  }

  pushStepsBlock() {
    let str = util.expand(grammar.steps, {steps: this.steps.join(',')});
    this.code.push(str);
  }

  // move a finished step into the steps and clear it
  moveStep() {
    let str = util.expand(grammar.step, {body: this.step.join('')});
    this.steps.push(str);
    this.step = [];
  }

  // VISIT
  handleVisit(url) {
    // if step is present move it to steps
    if (this.step.length) {
      // TODO handle nth visit
    } else {
      this.step.push(grammar.start);
      this.initialVisit = url;
    }
  }

  handleText(item) {
    let txt = grammar.TEXT[item.tokens[2][2]];
    let data = {selector: item.selector, ref: item.tokens[1][2]};
    this.step.push(util.expand(txt, data));
  }

  rewrite(iterator) {
    this.startCodeBlock();

    for (let item of iterator) {
      switch (item.tokens[0][0]) {
        case 'VISIT':
          this.handleVisit(item.tokens[0][1]);
          break;

        case 'TEXT':
        this.handleText(item);
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
