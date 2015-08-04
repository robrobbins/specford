class Lexer {
  constructor() {
    this.keywords = ['text', 'click', 'fill', 'after', 'url', 'select', 'selector',
      'capture', 'require'];

    this.regexes = {
      comment: /^--\s*.*/,
      whitespace: /^[^\n\S]+/,
      trailingSpaces: /\s+$/,
      // a catch all generic thing
      identifier: /^([$A-Za-z_/.]+\w*)/,
      // anything wrapped in single quotes
      reference: /^'([^"].*?)'/,
      number: /^([><0-9]+)/,
      assert: /^(exists?|(?:do|does)NotExist|(?:is|isNot)Visible|(?:is|isNot)Selected)/,
      vistBlock: /^visit\s+(.*):/,
      queryBlock: /^query\s+(.*):/
    };

    this.methodList = [
      'comment',
      'visit',
      'query',
      'assert',
      'reference',
      'number',
      'identifier',
      'whitespace'
    ];
  }

  clean(code) {
    return code.replace(/\r/g, '').replace(this.regexes.trailingSpaces, '');
  }

  visit(slice) {
    let match;
    if ((match = this.regexes.vistBlock.exec(slice))) {
      this.pushToken('VISIT', match[1]);
      this.taken = match[0].length;
    }
    return this.taken;
  }

  comment(slice) {
    let match;
    if ((match = this.regexes.comment.exec(slice))) {
      // dont include comments in the output
      this.taken = match[0].length;
    }
    return this.taken;
  }

  query(slice) {
    let match;
    if((match = this.regexes.queryBlock.exec(slice))) {
      this.pushToken('QUERY', match[1]);
      this.taken = match[0].length;
    }
    return this.taken;
  }

  reference(slice) {
    let match;
    if((match = this.regexes.reference.exec(slice))) {
      this.pushToken('REFERENCE', match[1]);
      this.taken = match[0].length;
    }
    return this.taken;
  }

  identifier(slice) {
    let match, id;
    if ((match = this.regexes.identifier.exec(slice))) {
      // keywords will have their own token entries as constants
      // rather than the generic 'IDENTIFIER'
      id = match[1];
      if (~this.keywords.indexOf(id)) {
        this.pushToken(id.toUpperCase(), id);
      } else this.pushToken('IDENTIFIER', id);
      // return the length of the match
      this.taken = id.length;
    }
    return this.taken;
  }

  number(slice) {
    let match, num, q, t;
    if ((match = this.regexes.number.exec(slice))) {
      num = match[1];
      // still match the original length
      this.taken = num.length;
      // is it an expression?
      q = num.charAt(0);
      // if so, break it apart here
      if (q === '<' || q === '>' ) {
        // take off the quantifier
        num = num.slice(1);
      // if its not an actual quantifier, clear it
      } else q = '';
      // it will be a string throughout...
      this.pushToken('NUMBER', num);
      // append the attr the same way that whitespace is, this means that a
      // number token can be expected to have a quantifier
      t = this.tokens[this.tokens.length - 1];
      t.quantifier = q;
    }
    return this.taken;
  }

  assert(slice) {
    let match;
    if ((match = this.regexes.assert.exec(slice))) {
      this.pushToken('ASSERT', match[1]);
      this.taken = match[1].length;
    }
    return this.taken;
  }

  pushToken(tag, val) { this.tokens.push([tag, val]); }

  whitespace(slice) {
    let prev = this.tokens[this.tokens.length - 1], match, nl;
    if((match = this.regexes.whitespace.exec(slice)) ||
        (nl = slice.charAt(0) === '\n')) {
      // we only care about the indent level of queries
      if (prev && prev[0] === 'QUERY') {
        if (match) prev.indented = match[0].length;
      }
      if (match) this.taken = match[0].length;
    }
    return this.taken;
  }

  tokenize(code) {
    // reset on any call thru here
    this.tokens = [];
    this.taken = 0;
    // take off any extra line breaks
    code = this.clean(code);

    // crawl the code assembling the token list
    return this._recurse(code, code.slice(0), 0);
  }

  _recurse(code, slice, i) {
    // base case is there are no more slices
    if (!slice) return this.tokens;
    else {
      this.methodList.some( meth => this[meth](slice) );
      // move the 'pointer' along in the file
      i += this.taken || 1;
      // will be falsy at the end
      slice = code.slice(i);
      // reset after use
      this.taken = 0;
      return this._recurse(code, slice, i);
    }
  }

}

module.exports = Lexer;
