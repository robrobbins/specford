var $ = require('sudoclass'),

    // Delegate of the rewriter that can take a set of
    // tokens, given from the parser and iterate
    // over them in steps that the rewriter can use
    // to produce the output that becomes a tmp file
    
    Iterator = function() {};

// inherit and extend the base model class, just in case...
Iterator.prototype = Object.extend({}, {
  makeInstructionSet: function(tokens) {
    var instructions = [],
      previousQueries = [],
      visitCount = 0,
      // keep track so we can back out to a previous level
      queryLevel = 0,
      // the current-most query token
      query;
    // the tokens will be in a flat array of arrays, break them into 
    // grouped [[VISIT, where,[], [VISIT, where, []]]
    tokens.forEach(function(token) {
      if(token[0] === 'VISIT') {
        // eventually the instructionSet length will === visitCount
        // not really needed as instructionSet.length will work but
        // its easier to read this way
        visitCount++;
        // if u were in a query you are not anymore
        query = null;
        // there are none yet
        queryStack = [];
        // the visit tokens are the only ones pushed directly to the instructionSet
        instructions.push(token);
      } else if(token[0] === 'QUERY') {
        // queries can stack (via the indent)
        if(!query) {
          // subsequent assertions and nested queries will need
          // to reference this
          query = token;
          // this gets pushed into the visit
          instructions[visitCount - 1].push(query);
          // no stacked queries at this point
        } else {
          // we are in a query and have encountered another
          // if the indent is greater, its a child
          if(query.indented < token.indented) {
            // the block indents...
            queryLevel++;
            // push this new query as a nested to the former
            query.push(token);
            // query is becoming the previous one
            queryStack.push(query);
            // any subsequent assertions are against this query
            query = token;
          } else if(query.indented === token.indented) {
            // a sibling query, nests in the queryStack[queryLevel - 1]
            queryStack[queryLevel - 1].push(token);
            // it does become the current query
            query = token;
          } else {
            // we need to use the queryLevel to return to a lower index
            // in the visit tree
            // TODO this
            queryLevel--;
            console.log('should not be here yet');

          }
        }
      } else {
        // all other statements form assertions against the current query
        // will error if no query, but thats expected
        query.push(token);
      }
    });
    // hand back the completed instruction set
    return instructions;
  },

  role: 'iterator'
});

module.exports = Iterator;
