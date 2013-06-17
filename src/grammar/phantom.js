module.exports = {
  '==': 'isTruthy',
  '!=': 'isFalsey',
  '===': 'isEqual',
  '!==': 'isNotEqual',
  '^=': 'Matches',
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
  URL: {
    '^=': 'urlMatches'
  },
  clickSelector: "test.click('${selector}');\n",
  // exists so that the rewriter knows to place subsequent tests in an onUrlChanged block
  clickLink: "test.click('${selector}');\n",
  page: "var page = require('webpage').create(), ",
  selectorExists: "test.selectorExists('${selector}');\n",
  selectorHasText: "test.selectorHasText('${selector}', '${text}');\n",
  selectorDoesntHaveText: "test.selectorDoesntHaveText('${selector}', '${text}');\n",
  urlMatches: "test.urlMatches(${regex});\n",
  onUrlChanged: "page.onUrlChanged = function(targetUrl) {next(targetUrl);};\n",
  start: "test.start(new Date().getTime());\n",
  stop: "test.stop(new Date().getTime());\ntest.report(${num});\nphantom.exit();\n",
  // the outer part of the test template, everything but the 'steps'
  page: "var page, rPage = require('webpage'), test = require('../src/utils/test'),\nsteps = [${steps}],\nnext = function(url) {\nif(page) page.close();\npage = rPage.create();\npage.open(url, steps.shift());\n};\nnext('${visit}');",
  step: "function(status) {\nif(status !== 'success') console.log('Network error');\nelse {\n${body}}\n}"
};
