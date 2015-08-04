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

  it('tokenizes selected', function() {
    var selected = this.l.tokenize("selector '.foo' isSelected");
    expect(selected).toEqual([['SELECTOR', 'selector'], ['REFERENCE', '.foo'], ['ASSERT', 'isSelected']]);
  });

  it('tokenizes !selected', function() {
    var selected = this.l.tokenize("selector '.foo' isNotSelected");
    expect(selected).toEqual([['SELECTOR', 'selector'], ['REFERENCE', '.foo'], ['ASSERT', 'isNotSelected']]);
  });

  it("tokenizes fill cadence (reference)", function() {
    var fill = this.l.tokenize("fill '.foo' 'bar'");
    expect(fill).toEqual([['FILL', 'fill'], ['REFERENCE', '.foo'], ['REFERENCE', 'bar']]);
  });

  it("tokenizes fill cadence (fixture)", function() {
    var fill = this.l.tokenize("fill '.foo' Bar.baz");
    expect(fill).toEqual([['FILL', 'fill'], ['REFERENCE', '.foo'], ['IDENTIFIER', 'Bar.baz']]);
  });

  it("tokenizes select cadence", function() {
    var sel = this.l.tokenize("select selector '.foo'");
    expect(sel).toEqual([['SELECT', 'select'], ['SELECTOR', 'selector'], ['REFERENCE', '.foo']]);
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

  it('tokenizes display', function() {
    var disp = this.l.tokenize("'.foo' isVisible");
    expect(disp).toEqual([['REFERENCE', '.foo'], ['ASSERT', 'isVisible']]);
  });

  it('tokenizes !display', function() {
    var ndisp = this.l.tokenize("'.bar' isNotVisible");
    expect(ndisp).toEqual([['REFERENCE', '.bar'], ['ASSERT', 'isNotVisible']]);
  });

  it('tokenizes require', function() {
    var req = this.l.tokenize("require users Rob");
    expect(req).toEqual([['REQUIRE', 'require'], ['IDENTIFIER', 'users'], ['IDENTIFIER', 'Rob']]);

    // does not freak out with a nested path for 1th arg if you use a ref
    req = this.l.tokenize("require projects/foo Bar");
    expect(req).toEqual([['REQUIRE', 'require'], ['IDENTIFIER', 'projects/foo'], ['IDENTIFIER', 'Bar']]);
  });
});
