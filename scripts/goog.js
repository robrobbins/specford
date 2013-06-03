var casper = require('casper').create();
casper.start('http://google.com');
casper.then(function then() {
  this.test.assertSelectorHasText('body', 'About Google');
  this.test.assertSelectorDoesntHaveText('body', 'Foo bar baz');

});
casper.run(function run() {
  this.test.done(2);
  this.test.renderResults(true);

});
