require('babel/register');

var R = require('../src/rewriter/phantom');

describe('The Rewriter', function() {

  beforeEach(function() {
    this.r = new R();
  });

  it('Exists', function() {
    expect(this.r instanceof R).toBe(true);
  });

  it("starts empty", function() {
    expect(this.r.code.length).toBeFalsy();
    expect(this.r.steps.length).toBeFalsy();
    expect(this.r.step.length).toBeFalsy();
  });

  it("starts the code block", function() {
    expect(this.r.code.length).toBeFalsy();
    this.r.startCodeBlock();
    expect(this.r.code.length).toBe(4);
    //console.log(this.r.code);
  });

  it("pushes a complete visit fn", function() {
    expect(this.r.code.length).toBeFalsy();
    this.r.pushVisitBlock();
    expect(this.r.code.length).toBe(1);
    console.log(this.r.code);
  });

});
