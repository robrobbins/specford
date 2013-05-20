var P = require('../src/parser');

describe('Parser', function() {
  beforeEach(function() {
    p = new P('examples/one.json');  
  });

  it('has been instantiated with a path', function() {
    expect(p.get('path')).toBe('examples/one.json');
  });

  it('records an error for an erroneous path', function() {
    p.set('path', 'examples/bogus.json');
    p.read();

    waitsFor(function() {
      return !!p.data.error;
    }, 'Parser did not execute the read', 3000);
      
    runs(function() {
      expect(p.get('error')).toBe('Cannot locate file at examples/bogus.json');
    });
  });

  it('reads a file given the correct path', function() {
    p.read();

    waitsFor(function() {
      return !!p.data.fileContents;
    }, 'Parser did not read the file', 3000);

    runs(function() {
      expect(p.get('fileContents')).toBeTruthy();
    });
  });

  it('parses a file given a correctly formatted string', function() {
    p.read();

    waitsFor(function() {
      return !!p.data.parsedContents;
    }, 'Parser did not read the file', 3000);

    runs(function() {
      expect(p.get('parsedContents')).toBeTruthy();
    });
  });

  it('sets the initial visit', function() {
    p.read();

    waitsFor(function() {
      return !!p.data.initialVisit;
    }, 'Parser did not extract the initial visit', 3000);

    runs(function() {
      expect(p.get('initialVisit')).toBeTruthy();
    });
  });
});
