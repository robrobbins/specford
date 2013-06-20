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
    link: 'clickLink',
    submit: 'clickSubmit'
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
  FILL: 'fillSelector',
  SUBMIT: {
    'selector': 'submitSelector'
  },
  WAIT: {
    'for': 'waitFor'
  },
  clickSelector: "test.click('${selector}');\n",
  // next 2 exist so that the rewriter knows to place subsequent tests in a new block
  clickLink: "test.click('${selector}');\n",
  clickSubmit: "test.click('${selector}');\n",
  fillSelector: "test.fillSelector('${selector}', '${value}');\n",
  selectorExists: "test.selectorExists('${selector}', ${waiting});\n",
  selectorDoesntExist: "test.selectorDoesntExist('${selector}', ${waiting});\n",
  selectorHasText: "test.selectorHasText('${selector}', '${text}', ${waiting});\n",
  selectorDoesntHaveText: "test.selectorDoesntHaveText('${selector}', '${text}', ${waiting});\n",
  urlMatches: "test.urlMatches(${regex});\n",
  onUrlChanged: "page.onUrlChanged = function(targetUrl) {next(targetUrl);};\n",
  start: "test.start(new Date().getTime());\n",
  stop: "test.stop(new Date().getTime());\ntest.report(${num});\nphantom.exit();\n",
  // the outer part of the test template, everything but the 'steps'
  vars: "var page, rPage = require('webpage'), test = require('../src/utils/test'),\npredicates = [${predicates}],\ncontinues = [${continues}],\npages = [${pages}],\nnext = function(url) {\nif(page) page.close();\npage = rPage.create();\npage.settings.loadImages = false;\npage.open(url, pages.shift());\n};\nnext('${visit}');",
  page: "function(status) {\nif(status !== 'success') console.log('Network error');\nelse {\n${body}}\n}",
  // trigger a native submit() on the element matching selector
  submitSelector: "test.submitSelector('${selector}');\n",
  // some tokens have no asserts, but 2 references
  twoRefs: {
    FILL: true
  },
  waitFor: "test.waitFor(predicates[${count}], continues[${count}], '${msg}');\n"
};
