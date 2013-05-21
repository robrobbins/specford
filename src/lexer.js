var $ = require('sudoclass');

var Lexer = function() {
  // spec keywords that will be rewritten into code fragments
  this.keywords = ['text', 'class', 'id', 'css', 'count', 'click', 'fill_in'];
  this.regexes = {
    whitespace: /^[^\n\S]+/,
    trailingSpaces: /\s+$/,
    identifier: /^([a-z_]\w*)/,
    number: /^([0-9]+)/,
    // == is truthy != is falsy
    operator: /^([<>\!=]=)/,
    vistBlock: /^visit\s+(.*):/,
    queryBlock: /^\$\s*(.*):/
  };
};

Lexer.prototype = Object.create(Object.extend({}, {
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

  queryToken: function() {
    var match;
    if((match = this.regexes.queryBlock.exec(this.chunk))) {
      this.pushToken('QUERY', match[1]);
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
        this.pushToken(id.replace('_', '').toUpperCase(), id);
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

  pushToken: function(tag, val) {
    this.tokens.push([tag, val]);
  },

  // delegates are fetched by role
  role: 'lexer',

  // can be a meaningless ws,
  // a meaningful argument 'paren-free'
  // or an indent for a block
  whitespaceToken: function() {
    var prev = this.tokens[this.tokens.length - 1], match, nl;
    if((match = this.regexes.whitespace.exec(this.chunk)) || 
        (nl = this.chunk.charAt(0) === '\n')) {
      if(prev) prev[match ? 'spaced' : 'newline'] = true;
      return match ? match[0].length : 0;
    } else return 0;
  },

  tokenize: function(code) {
    var taken, i = 0;
    this.tokens = [];
    // take off any extra line breaks
    code = this.clean(code);
    // crawl the code
    while((this.chunk = code.slice(i))) {
      taken = this.visitToken() ||
        this.queryToken() ||
        this.identifierToken() ||
        this.whitespaceToken() ||
        this.numberToken() || 1;
        
      i += taken;
    }
    return this.tokens;
  }
}));

module.exports = Lexer;
