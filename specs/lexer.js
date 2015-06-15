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

  it("tokenizes after", function() {
    var tokens = this.l.tokenize("after url contains '#foo'");

    expect(tokens).toEqual([['AFTER', 'after'], ['URL', 'url'], ['IDENTIFIER', 'contains'], ['REFERENCE', '#foo']]);
  });

  it('tokenizes numbers', function() {
    var tokens = this.l.tokenize('20');
    var inner = ['NUMBER', '20'];
    inner.quantifier = '';
    var outer = [inner];

    expect(tokens).toEqual(outer);
  });

  it('tokenizes lt number expression', function() {
    var tokens = this.l.tokenize('<10');
    var inner = ['NUMBER', '10'];
    inner.quantifier = '<';
    var outer = [inner];

    expect(tokens).toEqual(outer);
    expect(tokens[0].quantifier).toBe('<');
  });

  it('tokenizes gt number expression', function() {
    var tokens = this.l.tokenize('>1');
    var inner = ['NUMBER', '1'];
    inner.quantifier = '>';
    var outer = [inner];

    expect(tokens).toEqual(outer);
    expect(tokens[0].quantifier).toBe('>');
  });

  it('tokenizes exists', function() {
    var exists = this.l.tokenize("'foo' exists");

    expect(exists).toEqual([['REFERENCE', 'foo'], ['ASSERT', 'exists']]);
  });

  it('tokenizes exist', function() {
    var exist = this.l.tokenize(">5 '.foo' exist");
    var inner = ['NUMBER', '5'];
    inner.quantifier = '>';
    var outer = [inner];

    expect(exist).toEqual([inner, ['REFERENCE', '.foo'], ['ASSERT', 'exist']]);
  });

  it('tokenizes selector', function() {
    var exists = this.l.tokenize("selector '.foo' exists");

    expect(exists).toEqual([['SELECTOR', 'selector'], ['REFERENCE', '.foo'], ['ASSERT', 'exists']]);
  });

  it('tokenizes !exists', function() {
    var nexists = this.l.tokenize("'foo' doesNotExist");

    expect(nexists).toEqual([['REFERENCE', 'foo'], ['ASSERT', 'doesNotExist']]);
  });

  it('tokenizes !exist', function() {
    var nexists = this.l.tokenize("5 '.foo' doNotExist");
    var inner = ['NUMBER', '5'];
    inner.quantifier = '';
    expect(nexists).toEqual([inner, ['REFERENCE', '.foo'], ['ASSERT', 'doNotExist']]);
  });

  it("tokenizes fill cadence", function() {
    var fill = this.l.tokenize("fill '.foo' 'bar'");

    expect(fill).toEqual([['FILL', 'fill'], ['REFERENCE', '.foo'], ['REFERENCE', 'bar']]);
  });

  it('recognizes text', function() {
    var txt = this.l.tokenize("text 'foo'");

    expect(txt).toEqual([['TEXT', 'text'], ['REFERENCE', 'foo']]);

  });

  it('recognizes click', function() {
    var clik = this.l.tokenize("click selector '.foo'");

    expect(clik).toEqual([['CLICK', 'click'], ['SELECTOR', 'selector'], ['REFERENCE', '.foo']]);
  });

  it('tokenizes capture', function() {
    var cap = this.l.tokenize("capture jpeg 'foo'");

    expect(cap).toEqual([['CAPTURE', 'capture'], ['IDENTIFIER', 'jpeg'], ['REFERENCE', 'foo']]);
  });

  it('recognizes indent', function() {
    var i = this.l.tokenize('query foo:\n  selector');
    expect(i[0].indented).toBe(2);

  });
});
