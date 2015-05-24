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
    // when a step is ready to be moved, it must be wrapped...
    this.stepWrapper = 'openWrapper';
    // visits after the first are just steps...
    this.visits = 0;
    //
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
      case 'VISIT':
        this.handleVisit(item.tokens[0][1]);
        break;

      // queries do nothing here
      case 'QUERY':
        let pass;
        break;

      case 'AFTER':
        let isUrl = item.tokens[1][0] === 'URL';
        this.handleAfter(item, isUrl);
        break;

      case 'CAPTURE':
        this.handleCapture(item);
        break;

      case 'CLICK':
        this.handleCommand(item);
        break;

      case 'FILL':
        this.handleCommand(item, true);
        break;

      // observations are the default
      default:
        let isUrl = item.tokens[0][0] === 'URL';
        this.handleObservation(item, isUrl);
        break;
    }
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

  // test.after(steps.shift(), method, one, two)
  // one: selector or ref
  // two: ref
  handleAfter(item, isUrl) {
    // shift off the after token, leaving a triplet
    item.tokens.shift();
    let str = grammar.AFTER;
    let data = {};
    // an after call can only happen on observations, of which URL varies
    if (isUrl) {
      data.meth = grammar[item.tokens[0][0]][item.tokens[1][1]].after;
      // url has no selector
      data.one = item.tokens[2][1];
      data.two = undefined;
    }
    // or, a base observation
    else {
      data.meth = grammar[item.tokens[0][0]][item.tokens[2][1]].after;
      data.one = item.selector;
      data.two = item.tokens[1][1];
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

  handleCommand(item, isFill) {
    // commands have no after case
    let str = grammar[item.tokens[0][0]];
    let data = { selector: item.selector };
    // fill commands are FILL/ref/ref with the 1th ref being a sel, the last a val
    if (isFill) {
      data.ref = item.tokens[1][1];
      data.val = item.tokens[2][1];
      // non-fill command has no val
    } else data.ref = item.tokens[2][1];

    this.step.push(expand(str, data));
  }

  handleObservation(item, isUrl) {
    let data = { selector: item.selector };
    let str;
    // all observations have immediate + after use-case
    if (isUrl) {
      str = grammar[item.tokens[0][0]][item.tokens[1][1]].now;
      data.ref = item.tokens[2][1];
    } else {
      str = grammar[item.tokens[0][0]][item.tokens[2][1]].now;
      data.ref = item.tokens[1][1];
    }
    this.step.push(expand(str, data));
  }

  rewrite(iterator) {
    this.startCodeBlock();

    for (let item of iterator) {
      this.handleItem(item);
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
