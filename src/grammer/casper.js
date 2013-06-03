// TODO Jison? This is sort of a BNF already

module.exports = {
  '==': 'assertTruthy',
  '!=': 'assertFalsey',
  '===': 'assertEquals',
  '!==': 'assertNotEquals',
  '//=': 'assertMatch',
  VISIT: 'start',
  VISIBLE: {
    '===': 'assertVisible',
    '==': 'assertVisible',
    '!==': 'assertNotVisible',
    '!=': 'assertNotVisible'
  },
  QUERY: 'then',
  TEXT: {
    '?': 'assertSelectorHasText',
    '!?': 'assertSelectorDoesntHaveText'
  },
  SELECTOR: {
    '?': 'assertSelectorExists',
    '!?': 'assertSelectorDoesntExist'
  },
  ELEMENT: {
    '?': 'assertExists',
    '!?': 'assertDoesntExist'
  },
  noAssert: {
    CLICK: true
  },
  URL: {
    '//=': 'assertUrlMatch'
  },
  require: "var casper = require('casper').create();\n",
  start: "casper.start('${where}');\n",
  then: "casper.then(${fn});\n",
  run: "casper.run(${fn});\n",
  done: "  this.test.done(${num});\n",
  renderResults: "  this.test.renderResults(${bool});\n",
  assertSelectorExists: "  this.test.assertSelectorExists('${selector}');\n",
  assertSelectorHasText: "  this.test.assertSelectorHasText('${selector}', '${text}');\n",
  assertSelectorDoesntHaveText: "  this.test.assertSelectorDoesntHaveText('${selector}', '${text}');\n"
};
