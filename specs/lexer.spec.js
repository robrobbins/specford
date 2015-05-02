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

  it('tokenizes !equals', function() {
    var neq = this.l.tokenize("'foo' doesNotEqual 'bar'");

    expect(neq).toEqual([['REFERENCE', 'foo'], ['ASSERT', 'doesNotEqual'], ['REFERENCE', 'bar']]);
  });

  it('tokenizes isVisible', function() {
    var viz = this.l.tokenize("'foo' isVisible");

    expect(viz).toEqual([['REFERENCE', 'foo'], ['ASSERT', 'isVisible']]);
  });

  it('tokenizes isNotVisible', function() {
    var nviz = this.l.tokenize("'foo' isNotVisible");

    expect(nviz).toEqual([['REFERENCE', 'foo'], ['ASSERT', 'isNotVisible']]);
  });

  it('recognizes text', function() {
    var txt = this.l.tokenize("text 'foo'");

    expect(txt).toEqual([['TEXT', 'text'], ['REFERENCE', 'foo']]);

  });

  it('recognizes click', function() {
    var clik = this.l.tokenize("click 'foo'");

    expect(clik).toEqual([['CLICK', 'click'], ['REFERENCE', 'foo']]);

  });

  it('recognizes indent', function() {
    var i = this.l.tokenize('query foo:\n  selector');
    expect(i[0].indented).toBe(2);

  });
});
