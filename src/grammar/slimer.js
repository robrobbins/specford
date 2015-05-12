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
    selector: "test.clickSelector('${selector}', '${ref}');\n"
  },

  AFTER: {
    url: {
      change: "pg.onUrlChanged = steps.shift();\n"
    }
  },

  FILL: {
    selector: "test.fillSelector('${selector}', '${ref}', '${val}');\n"
  },

  URL: {
    contains: "test.urlContains()"
  },

  start: "test.start();\n",
  stop: "test.stop();\n",
  exit: "slimer.exit();\n",
  tester: "var Tester = require('../src/utils/tester');\nvar test = new Tester;\n",
  logger: "var Logger = require('../src/utils/logger');\nvar log = new Logger;\n",
  colorizer: "var colorizer = require('../src/utils/colorizer');\n",
  pgNull: "var pg = null;\n",
  pgIf: "if(pg) pg.close();\n",
  pgElse: "else {\npg = require('webpage').create();\ntest.pg = pg;\npg.viewportSize = { width: 800, height: 600 };\npg.onConsoleMessage = function(msg) {log.unstamped(msg, 'magenta');};\npg.onNavigationRequested = function(url, type) {log.stamped(('navigating to: ' + url), 'gray');};\npg.onError = function(msg, tr) { var stack = ['ERROR: ' + msg]; if (tr && tr.length) { stack.push('TRACE:'); tr.forEach(function(t) { stack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function *' + t.function +'*)' : '')); }); } log.unstamped(stack.join('\\n'), 'yellow'); };\n}\n",
  pgOpen: "pg.open(url, steps.shift());\n",
  logOpening: "log.pgOpening();\n",
  logOpened: "log.pgOpened();\n",

  steps: "var steps = [\n${steps}\n];\n",
  openWrapper: "function(status) {\nif(status !== 'success') log.unstamped('Network error', 'error');\nelse {\n${body}}}",
  urlChangeWrapper: "function(url) {\nlog.stamped('navigated to: ' + url, 'gray');\n${body}}",

  visitFn: "var visit = function(url) {\n${body}};\n",
  visitCall: "visit('${url}');\n"

};
