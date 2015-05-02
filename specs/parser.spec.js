require('babel/register');
var P = require('../src/parser');

describe('Parser', function() {
  beforeEach(function() {
    this.p = new P();
    this.spies = {
      error: function() {},
      read: function(data) {}
    };
    spyOn(this.spies, 'error');
    spyOn(this.spies, 'read');

    this.p.on('error', this.spies.error);
    this.p.on('read', this.spies.read);
  });

  it('exists', function() {
    expect(this.p).toBeTruthy();
  });

  it('records an error for an erroneous path', function() {
    this.p.read('./spec/bogus.spec');

    waitsFor(function() {
      return this.spies.error.calls.length === 1;
    }, 'Parser did not execute the read', 3000);

    runs(function() {
      expect(this.spies.error).toHaveBeenCalledWith('Cannot locate file at ./spec/bogus.spec');
    });
  });

  it('reads a file given the correct path', function() {
    this.p.read('./spec/goog.spec');

    waitsFor(function() {
      return this.spies.read.calls.length === 1 ||
        this.spies.error.calls.length === 1;
    }, 'Parser did not read the file', 3000);

    runs(function() {
      expect(this.spies.error).not.toHaveBeenCalled();
      expect(this.spies.read).toHaveBeenCalled();
    });
  });
});
