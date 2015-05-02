/*
  take the flat token array from by the lexer and produce organized
  output via an exposed `next` method that the rewriter can use:


*/
class Iterator {
  constructor() {
    this.singles = ['VISIT', 'QUERY'];

  }


  initialize(tokens) {
    this.tokens = tokens;

    // define an iterator to send out logical groups of lexer tokens
    // that map to a single 'step'
    this[Symbol.iterator] = function() {
      // when yielding a step via next, send the current selector scope. This
      // array should, at all times, reflect the accumulated `query`s
      var qStack = [], qLevels = {}, singles = this.singles,
        tokens = this.tokens;

      return {
        next: () => {
          let step = { tokens: null, scope: ''};

          if (tokens.length) {
            let t = tokens[0];

            if (~singles.indexOf(t[0])) {
              // queryStack maintenence
              if (t[0] === 'QUERY') {
                // prune all with indent >= t
                if (qStack.length) qStack = qStack.filter(q => qLevels[q] < t.indented);
                qStack.push(t[1]);
                qLevels[t[1]] = t.indented;
              }
              step.tokens = tokens.shift();
              return { value: step, done: false};
            } else {
              step.tokens = tokens.splice(0, 3);
              step.scope = qStack.join(' ');
              return { value: step, done: false};
            }
          } else return {value: undefined, done: true };
        }
      };
    };
  }

}

module.exports = Iterator;
