var $ = require('sudoclass'),

    // Delegate of the rewriter that can take a set of
    // tokens, given from the parser and iterate
    // over them in steps that the rewriter can use
    // to produce the output that becomes a tmp file
    
    Iterator = function() {};

// inherit and extend the base model class, just in case...
Iterator.prototype = $.extend({}, {
  makeInstructionSet: function(tokens) {
    var instructions = [],
      visitCount = 0,
      // the current-most query token
      query, queryLevel, queryStack;
    // the tokens will be in a flat array of arrays, break them into 
    // grouped [[VISIT, where,[query,[what][...]]]]
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
        queryLevel = 0;
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
            // a sibling query, either nests in the queryStack[queryLevel - 1]
            // or replaces the topmost query
            if(queryLevel === 0) instructions[visitCount - 1].push(token);
            else queryStack[queryLevel - 1].push(token);
            // becomes the current query
            query = token;
          } else {
            // this token may have traversed bacwards in the queryStack
            // more than a single level. The base case is that it 'resets'
            // the top level query of the current visit
            for(queryLevel; queryLevel >= 0; queryLevel--) {
              // if we hit 0, reset the 'top level' query
              if(queryLevel === 0) {
                query = token;
                // the queryStack will have been emptied by this point
                instructions[visitCount - 1].push(query);
              } else {
                if(token.indented > queryStack[queryLevel - 1].indented) {
                  // push this in to that one and bail
                  queryStack[queryLevel - 1].push(token);
                  query = token;
                  break;
                } else {
                  // pop off the previous query in the stack and continue
                  queryStack.pop();
                }
              }
            }
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
