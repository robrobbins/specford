// TODO Jison? This is sort of a BNF already

module.exports = {
  '==': 'isTruthy',
  '!=': 'isFalsey',
  '===': 'isEqual',
  '!==': 'isNotEqual',
  '^=': 'Matches',
  VISIT: 'open',
  VISIBLE: {
    '===': 'isVisible',
    '==': 'isVisible',
    '!==': 'isNotVisible',
    '!=': 'isNotVisible'
  },
  TEXT: {
    '?': 'selectorHasText',
    '!?': 'selectorDoesntHaveText'
  },
  CLICK: {
    selector: 'clickSelector',
    link: 'clickLink'
  },
  SELECTOR: {
    '?': 'selectorExists',
    '!?': 'selectorDoesntExist'
  },
  ELEMENT: {
    '?': 'exists',
    '!?': 'doesntExist'
  },
  noAssert: {},
  URL: {
    '^=': 'urlMatches'
  },
  clickSelector: "test.click('${selector}');\n",
  // exists so that the rewriter knows to place subsequent tests in an onUrlChanged block
  clickLink: "test.click('${selector}');\n",
  page: "var page = require('webpage').create(), test = require('../src/utils/test');\n",
  open: "page.open('${where}', function(status) {\nif(status !== 'success') console.log('Network Error');\nelse {\n${body}\n}\n});\n",
  exit: "phantom.exit();\n",
  selectorExists: "test.selectorExists('${selector}');\n",
  selectorHasText: "test.selectorHasText('${selector}', '${text}');\n",
  selectorDoesntHaveText: "test.selectorDoesntHaveText('${selector}', '${text}');\n",
  urlMatches: "test.urlMatches(targetUrl, ${regex});\n",
  onUrlChanged: "page.onUrlChanged = function(targetUrl) {\n${body}\n};",
  report: "test.report(${num});\n",
  start: "test.start(new Date().getTime());\n",
  stop: "test.stop(new Date().getTime());\n"
};
