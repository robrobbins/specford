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

});
