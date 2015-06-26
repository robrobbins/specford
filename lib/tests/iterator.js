require('babel/register');

var I = require('../src/iterator');

describe('The Iterator', function() {

  beforeEach(function() {
    this.i = new I();
  });

  it('Exists', function() {
    expect(this.i instanceof I).toBe(true);
  });

  it('Initializes correctly', function() {
    this.i.initialize([1,2]);
    expect(this.i[Symbol.iterator]).toBeTruthy();
    expect(typeof this.i[Symbol.iterator]).toBe('function');
    expect(this.i[Symbol.iterator]()).toBeTruthy();
    expect(typeof this.i[Symbol.iterator]().next).toBe('function');
  });

  it('handles singles', function() {
    var vis = ['VISIT', 'www.test.com'];
    var q = ['QUERY', '.foo-bar'];
    q.indented = 4;
    var t = [vis, q];

    this.i.initialize(t);
    var next = this.i[Symbol.iterator]().next;
    var v = next();
    expect(v.value.tokens.length).toBe(1);
    expect(v.value.tokens[0][0]).toBe('VISIT');

    var qu = next();
    expect(qu.value.tokens.length).toBe(1);
    expect(qu.value.tokens[0][0]).toBe('QUERY');

  });

  it('handles a triplet', function() {
    var c = ['CLICK', 'click'];
    var s = ['SELECTOR', 'selector'];
    var r = ['REFERENCE', '.foo'];
    var t = [c, s, r];

    this.i.initialize(t);
    var next = this.i[Symbol.iterator]().next;
    var tri = next();
    expect(tri.value.tokens.length).toBe(3);
    expect(tri.value.tokens[0][0]).toBe('CLICK');
    expect(tri.value.tokens[1][0]).toBe('SELECTOR');
    expect(tri.value.tokens[2][0]).toBe('REFERENCE');
  });

  // AFTER should trigger...
  it('handles a quadruplet', function() {
    var a = ['AFTER', 'after'];
    var s = ['SELECTOR', 'selector'];
    var r = ['REFERENCE', '.foo'];
    var as = ['ASSERT', 'exists'];
    var t = [a, s, r, as];

    this.i.initialize(t);
    var next = this.i[Symbol.iterator]().next;
    var q = next();
    expect(q.value.tokens.length).toBe(4);
    expect(q.value.tokens[0][0]).toBe('AFTER');
    expect(q.value.tokens[1][0]).toBe('SELECTOR');
    expect(q.value.tokens[2][0]).toBe('REFERENCE');
    expect(q.value.tokens[3][0]).toBe('ASSERT');
  });

  it("stacks the selection", function() {
    var q = ['QUERY', '#foo-bar'];
    q.indented = 4;
    var c = ['CLICK', 'click'];
    var s = ['SELECTOR', 'selector'];
    var r = ['REFERENCE', '.foo'];
    var r2 = ['REFERENCE', '.vop'];
    // stacks...
    var q2 = ['QUERY', '.baz'];
    q2.indented = 6;

    var t = [q, c, s, r, q2, c, s, r2];

    this.i.initialize(t);
    var next = this.i[Symbol.iterator]().next;
    var qu = next();
    var tri = next();
    expect(tri.value.tokens.length).toBe(3);
    expect(tri.value.selector).toBe('#foo-bar');
    var qu2 = next();
    var tri2 = next();
    expect(tri2.value.tokens.length).toBe(3);
    expect(tri2.value.selector).toBe('#foo-bar .baz');
  });

  it("replaces the selection", function() {
    var q = ['QUERY', '#foo-bar'];
    q.indented = 4;
    var c = ['CLICK', 'click'];
    var s = ['SELECTOR', 'selector'];
    var r = ['REFERENCE', '.foo'];
    var r2 = ['REFERENCE', '.vop'];
    // !stacks...
    var q2 = ['QUERY', '.baz'];
    q2.indented = 4;

    var t = [q, c, s, r, q2, c, s, r2];

    this.i.initialize(t);
    var next = this.i[Symbol.iterator]().next;
    var qu = next();
    var tri = next();
    expect(tri.value.tokens.length).toBe(3);
    expect(tri.value.selector).toBe('#foo-bar');
    var qu2 = next();
    var tri2 = next();
    expect(tri2.value.tokens.length).toBe(3);
    expect(tri2.value.selector).toBe('.baz');
  });

});
