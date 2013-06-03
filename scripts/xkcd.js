var casper = require('casper').create();
casper.start('http://xkcd.com/149');
casper.then(function then() {
  this.test.assertSelectorExists('#topContainer #masthead');
  this.test.assertSelectorHasText('#topContainer #masthead', 'A webcomic of');
  this.test.assertSelectorHasText('#topContainer #news', 'You can get');

});
casper.run(function run() {
  this.test.done(3);
  this.test.renderResults(true);

});
