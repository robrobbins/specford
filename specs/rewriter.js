require('babel/register');

var R = require('../src/rewriter/slimer');

describe('The Rewriter', function() {

  beforeEach(function() {
    this.r = new R();
  });

  it('Exists', function() {
    expect(this.r instanceof R).toBe(true);
  });

  describe("block handling", function() {
    it("starts empty", function() {
      expect(this.r.code.length).toBeFalsy();
      expect(this.r.steps.length).toBeFalsy();
      expect(this.r.step.length).toBeFalsy();
    });

    it("starts the code block", function() {
      expect(this.r.code.length).toBeFalsy();
      this.r.startCodeBlock();
      expect(this.r.code.length).toBe(5);
      //console.log(this.r.code);
    });

    it("pushes a complete visit fn", function() {
      expect(this.r.code.length).toBeFalsy();
      this.r.pushVisitBlock();
      expect(this.r.code.length).toBe(1);
      //console.log(this.r.code);
    });

    it("pushes steps to code", function() {
      this.r.pushStepsBlock();
      expect(this.r.code.length).toBe(1);
      //console.log(this.r.code);
    });

    it("pushes step to steps", function() {
      this.r.step.push('foo');
      expect(this.r.step.length).toBe(1);
      expect(this.r.steps.length).toBe(0);
      this.r.moveStep();
      expect(this.r.step.length).toBe(0);
      expect(this.r.steps.length).toBe(1);
    });
  });

  describe("token handling", function() {
    it("handles first visit token", function() {
      this.r.handleVisit('foo.com');
      expect(this.r.initialVisit).toBe('foo.com');
      expect(this.r.step.length).toBe(2);
    });

    // TODO handle multiple visits
  });

});
