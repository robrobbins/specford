var P = require('../src/parser'), spy;

describe('Iterator', function() {
  beforeEach(function() {
    p = new P('specs/xkcd.spec');
    spy = spyOn(p.delegate('rewriter').delegate('iterator'), 
      'makeInstructionSet').andCallThrough();
  });

  it('creates an instruction set, given tokens from the Parser', function() {
    p.read();

    waitsFor(function() {
      return !!p.data.tokens;
    }, 'Parser did not lex the file', 3000);

    runs(function() {
      expect(spy).toHaveBeenCalled();
    });
  });

});
