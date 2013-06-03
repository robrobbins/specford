var P = require('../src/parser'),
  R = require('../src/rewriter');

describe('Rewriter', function() {
  beforeEach(function() {
    p = new P('specs/xkcd.spec');
  });

  it('creates an instruction set, given tokens from the Parser', function() {
    p.read();

    waitsFor(function() {
      return !!p.data.code;
    }, 'Rewriter did not write the codez', 3000);

    runs(function() {
      console.log(p.data.code);
      expect(p.data.code).toBeTruthy();
    });
  });

});
