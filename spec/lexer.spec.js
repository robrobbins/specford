require('babel/register');

var L = require('../src/lexer');

describe('The Lexer', function() {

  beforeEach(function() {
    this.l = new L();
  });

  it('Exists', function() {
    expect(this.l instanceof L).toBe(true);
  });

  it('tokenizes visits', function() {
    var tokens = this.l.tokenize('visit foo:');
    expect(tokens).toEqual([['VISIT', 'foo']]);
  });

  it('tokenizes query', function() {
    var tokens = this.l.tokenize('query foo:');

    expect(tokens).toEqual([['QUERY', 'foo']]);
  });

  it('tokenizes comment', function() {
    var tokens = this.l.tokenize('--query foo:');

    expect(tokens).toEqual([]);
    // inspect the comment method
    var n = this.l.comment('--query foo:');
    expect(n).toBe(12);
    // does not push to token list
    expect(this.l.tokens.length).toBeFalsy();
  });

  it('tokenizes reference (and the generic identifier)', function() {
    var tokens = this.l.tokenize("notRef 'isRef'");

    expect(tokens).toEqual([['IDENTIFIER', 'notRef'], ['REFERENCE', 'isRef']]);
  });

  it('tokenizes numbers', function() {
    var tokens = this.l.tokenize('2015');

    expect(tokens).toEqual([['NUMBER', 2015]]);
  });

  it('tokenizes exists', function() {
    var exists = this.l.tokenize("'foo' exists");

    expect(exists).toEqual([['REFERENCE', 'foo'], ['ASSERT', 'exists']]);
  });

  it('tokenizes !exists', function() {
    var nexists = this.l.tokenize("'foo' doesNotExist");

    expect(nexists).toEqual([['REFERENCE', 'foo'], ['ASSERT', 'doesNotExist']]);
  });

  it('tokenizes equals', function() {
    var eq = this.l.tokenize("'foo' equals 'bar'");

    expect(eq).toEqual([['REFERENCE', 'foo'], ['ASSERT', 'equals'], ['REFERENCE', 'bar']]);
  });

});
