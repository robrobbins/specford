module.exports = {

  TEXT: {
    exists: "test.textExists('${selector}', '${ref}');\n",
    doesNotExist: "test.textDoesNotExist('${selector}', '${ref}');\n"
  },

  SELECTOR: {
    exists: "test.selectorExists('${selector}', '${ref}');\n",
    doesNotExist: "test.selectorDoesNotExist('${selector}', '${ref}');\n"
  },

  CLICK: {
    selector: "dom.clickSelector('${selector}', '${ref}');\n"
  },

  FILL: {
    selector: "dom.fillSelector('${selector}', '${ref}', '${val}');\n"
  },

  URL: {
    contains: "test.urlContains('${ref}')",
    matches: "test.urlMatches('${ref}')"
  },

  CAPTURE: "pg.render('${name}.${ext}', {format: '${ext}', quality: '100'});\n",

  start: "test.start();\n",
  stop: "test.stop();\n",
  exit: "slimer.exit();\n",
  dom: "var Dom = require('../src/utils/dom');\nvar dom = new Dom;\n",
  tester: "var Tester = require('../src/utils/tester');\nvar test = new Tester(dom);\n",
  logger: "var Logger = require('../src/utils/logger');\nvar log = new Logger;\n",
  colorizer: "var colorizer = require('../src/utils/colorizer');\n",
  pgNull: "var pg = null;\n",
  pgIf: "if(pg) pg.close();\n",
  pgElse: {
    wrapper: "else {\n${body}}\n",
    create: "pg = require('webpage').create();\n",
    ref: "dom.setPageRef(pg);\n",
    viewport: "pg.viewportSize = { width: 800, height: 600 };\n",
    console: "pg.onConsoleMessage = function(msg) {log.unstamped(msg, 'magenta');};\n",
    nav: "pg.onNavigationRequested = function(url, type) {log.stamped(('navigating to: ' + url), 'gray');};\n",
    error: "pg.onError = function(msg, tr) { var stack = ['ERROR: ' + msg]; if (tr && tr.length) { stack.push('TRACE:'); tr.forEach(function(t) { stack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function *' + t.function +'*)' : '')); }); } log.unstamped(stack.join('\\n'), 'yellow'); };\n"
  },
  pgOpen: "pg.open(url, steps.shift());\n",
  logOpening: "log.pgOpening();\n",
  logOpened: "log.pgOpened();\n",

  steps: "var steps = [\n${steps}\n];\n",
  openWrapper: "function(status) {\nif(status !== 'success') log.unstamped('Network error', 'error');\nelse {\n${body}}}",
  urlChangeWrapper: "function(url) {\nlog.stamped('navigated to: ' + url, 'gray');\n${body}}",

  visitFn: "var visit = function(url) {\n${body}};\n",
  visitCall: "visit('${url}');\n"

};
