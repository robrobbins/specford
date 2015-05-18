/*
  take the flat token array from by the lexer and produce organized
  output via an exposed `next` method that the rewriter can use:


*/
class Iterator {
  constructor() {
    this.singles = ['VISIT', 'QUERY'];
    this.quads = ['AFTER'];
  }

  initialize(tokens) {
    this.tokens = tokens;
    this.qStack = [];
    this.qLevels = {};

    // define an iterator to send out logical groups of lexer tokens
    // that map to a single 'step'
    this[Symbol.iterator] = function() {
      return {
        next: () => {
          let step = { tokens: null, selector: ''};

          if (this.tokens.length) {
            let t = this.tokens[0];

            if (~this.singles.indexOf(t[0])) {
              // queryStack maintenence
              if (t[0] === 'QUERY') {
                // prune all with indent >= t
                if (this.qStack.length) {
                  this.qStack = this.qStack.filter(q => this.qLevels[q] < t.indented);
                }
                this.qStack.push(t[1]);
                this.qLevels[t[1]] = t.indented;
              }
              step.tokens = [this.tokens.shift()];
              return { value: step, done: false };
            } else {
              // `after` modifies the 3 step triplet
              let n = (~this.quads.indexOf(t[0])) ? 4 : 3;
              step.tokens = this.tokens.splice(0, n);
              step.selector = this.qStack.join(' ');
              return { value: step, done: false};
            }
          } else return {value: undefined, done: true };
        }
      };
    };
  }

}

module.exports = Iterator;
