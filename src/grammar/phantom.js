module.exports = {
  TEXT: {
    exists: 'selectorHasText',
    doesNotExist: 'selectorDoesNotHaveText'
  },
  CLICK: {
    SELECTOR: 'clickSelector',
    link: 'clickLink'
  },
  SELECTOR: {
    exists: 'selectorExists',
    doesNotExist: 'selectorDoesNotExist'
  },
  URL: {
    matches: 'urlMatches'
  },
  FILL: 'fillSelector',
  WAIT: {
    'for': 'waitFor'
  },
  PRESSBUTTTON: 'pressButton',
  clickSelector: "test.click('${selector}');\n",
  clickLink: "??",
  fillSelector: "test.fillSelector('${selector}', '${value}');\n",
  selectorExists: "test.selectorExists('${selector}', ${waiting});\n",
  selectorDoesNotExist: "test.selectorDoesNotExist('${selector}', ${waiting});\n",
  selectorHasText: "test.selectorHasText('${selector}', '${text}', ${waiting});\n",
  selectorDoesNotHaveText: "test.selectorDoesNotHaveText('${selector}', '${text}', ${waiting});\n",
  urlMatches: "test.urlMatches(${regex});\n",
  start: "test.start(new Date().getTime());\n",
  stop: "test.stop(new Date().getTime());\ntest.report(${num});\nbrowser.close();\n",
  // the outer part of the test template, everything but the 'steps'
  vars: "var Browser = require('zombie'), browser = new Browser({debug:true});\n",
  page: "",
  // some tokens have no asserts, but 2 references
  twoRefs: {
    FILL: true
  },
  visit: "browser.visit();\n",
  waitFor: "test.waitFor(??, '${msg}');\n"
};
