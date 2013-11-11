module.exports = {
  TEXT: {
    exists: 'selectorHasText',
    doesNotExist: 'selectorDoesNotHaveText'
  },
  CLICK: {
    selector: 'clickSelector',
    link: 'clickLink',
    submit: 'clickSubmit'
  },
  SELECTOR: {
    exists: 'selectorExists',
    doesNotExist: 'selectorDoesNotExist'
  },
  ELEMENT: {
    exists: 'elementExists',
    doesNotExist: 'elementDoesNotExist'
  },
  URL: {
    matches: 'urlMatches'
  },
  FILL: 'fillSelector',
  WAIT: {
    'for': 'waitFor'
  },
  clickSelector: "browser.fire('click', '${selector}', callbacks.shift());\n",
  // next 2 exist so that the rewriter knows to place subsequent tests in a new block
  clickLink: "browser.clickLink('${selector}', callbacks.shift());\n",
  clickSubmit: "browser.pressButton('${selector}', callbacks.shift());\n",
  fillSelector: "browser.fill('${selector}', '${value}', callbacks.shift());\n",
  selectorExists: "test.selectorExists('${selector}');\n",
  selectorDoesNotExist: "test.selectorDoesNotExist('${selector}');\n",
  selectorHasText: "test.selectorHasText('${selector}', '${text}');\n",
  selectorDoesNotHaveText: "test.selectorDoesNotHaveText('${selector}', '${text}');\n",
  urlMatches: "test.urlMatches(${regex});\n",
  start: "test.start(new Date().getTime());\n",
  stop: "test.stop(new Date().getTime());\ntest.report(${num});\n",
  // the outer part of the test template, everything but the 'steps'
  vars: "var Browser = require('zombie'),\nbrowser = new Browser(),\ntest = require('../src/utils/test'),\ncallbacks = [${callbacks}],\nopened,\npages = [${pages}],\nnext = function(url) {\nif(opened) browser.close();\nbrowser.open();\nopened=true;\ntest.setBrowserRef(browser);\nbrowser.visit(url, pages.shift());};\nnext('${visit}');",
  page: "function() {\nif(browser.statusCode !== 200) console.log('Network error');\nelse {\n${body}}\n}",
  // some tokens have no asserts, but 2 references
  twoRefs: {
    FILL: true
  },
  reversed: {
    CLICK: true,
    URL: true
  },
  waitFor: "\n"
};
