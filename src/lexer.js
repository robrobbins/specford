var $ = require('sudoclass');

var Lexer = function() {
  // spec keywords that will be rewritten into code fragments
  this.keywords = ['text', 'click', 'fill', 'wait', 'submit', 'url', 'link', 'selector', 'for'];
  this.regexes = {
    comment: /^--\s*.*/,
    whitespace: /^[^\n\S]+/,
    trailingSpaces: /\s+$/,
    // a catch all generic thing
    identifier: /^([$A-Za-z_]\w*)/,
    // anything wrapped in double quotes
    reference: /^'([^"].*?)'/,
    number: /^([0-9]+)/,
    // == is truthy != is falsy etc
    assert: /^([!]*\?|[<>\!\^=]=)/,
    vistBlock: /^visit\s+(.*):/,
    queryBlock: /^\$\s*(.*):/
  };
  // indent level will scope selectors
  this.currentIndent = 0;
};

Lexer.prototype = $.extend({}, {
  addedAsDelegate: function(delegator) {
    // observe the fileContents key of the parser
    // and tokenize them when available
    delegator.observe(this.tokenizeFileContents.bind(this));
  },
  clean: function(code) {
    return code.replace(/\r/g, '').replace(this.regexes.trailingSpaces, '');
  },

  visitToken: function() {
    var match;
    if((match = this.regexes.vistBlock.exec(this.chunk))) {
      this.pushToken('VISIT', match[1]);
      return match[0].length;
    } else return 0;
  },

  commentToken: function() {
    var match;
    if((match = this.regexes.comment.exec(this.chunk))) {
      // dont include comments in the output
      return match[0].length;
    } else return 0;
  },

  queryToken: function() {
    var match;
    if((match = this.regexes.queryBlock.exec(this.chunk))) {
      this.pushToken('QUERY', match[1]);
      return match[0].length;
    } else return 0;
  },

  referenceToken: function() {
    var match, escaped;
    if((match = this.regexes.reference.exec(this.chunk))) {
      this.pushToken('REFERENCE', match[1]);
      return match[0].length;
    } else return 0;
  },

  identifierToken: function() {
    var match, id;
    if((match = this.regexes.identifier.exec(this.chunk))) {
      // keywords will have their own token entries as constants
      // rather than the generic 'IDENTIFIER'
      id = match[1];
      if(this.keywords.indexOf(id) !== -1) {
        this.pushToken(id.toUpperCase(), id);
      } else this.pushToken('IDENTIFIER', id);
      // return the length of the match
      return id.length;
    } else return 0;
  },

  numberToken: function() {
    var match, num;
    if((match = this.regexes.number.exec(this.chunk))) {
      num = match[1];
      this.pushToken('NUMBER', parseInt(num, 10));
      return num.length;
    } else return 0;
  },

  assertToken: function() {
    var match;
    if((match = this.regexes.assert.exec(this.chunk))) {
      this.pushToken('ASSERT', match[1]);
      return match[1].length;
    } else return 0;
  },

  pushToken: function(tag, val) {
    this.tokens.push([tag, val]);
  },

  // Delegates must have a 'role'
  role: 'lexer',

  whitespaceToken: function() {
    var prev = this.tokens[this.tokens.length - 1], match, nl;
    if((match = this.regexes.whitespace.exec(this.chunk)) || 
        (nl = this.chunk.charAt(0) === '\n')) {
      // we only care about the indent level of queries
      if(prev && prev[0] === 'QUERY') {
        if(match) {
          prev['indented'] = match[0].length;
        }
      }
      return match ? match[0].length : 0;
    } else return 0;
  },

  // seperate from tokenizeFileContents for ease of testing
  tokenize: function(code) {
    var taken, i = 0;
    this.tokens = [];
    // take off any extra line breaks
    code = this.clean(code);
    // crawl the code
    while((this.chunk = code.slice(i))) {
      taken = this.visitToken() ||
        this.commentToken() ||
        this.queryToken() ||
        this.assertToken() ||
        this.referenceToken() ||
        this.numberToken() ||
        this.identifierToken() ||
        this.whitespaceToken() || 1;
        
      i += taken;
    }
    // reset the currentIndent
    this.currentIndent = 0;
    return this.tokens;
  },

  // the observer set on the parser (my delegator)
  tokenizeFileContents: function(change) {
    if(change.name === 'fileContents') {
      // dont care about other changes to its Model
      this.delegator.set('tokens', this.tokenize(change.object.fileContents));
    }
  }
});

module.exports = Lexer;
