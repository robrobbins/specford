module.exports = {

  TEXT: {
    exists: "test.textExists('${selector}', '${ref}');\n",
    doesNotExist: "test.textDoesNotExist('${selector}', '${ref}');\n"
  },

  start: "test.start();\n",
  stop: "test.stop();\n",
  exit: "phantom.exit();\n",
  tester: "var Tester = require('../src/utils/tester');\n",
  test: "var test = new Tester(pg);\n",
  pgNull: "var pg = null;\n",
  pgIf: "if(pg) pg.close();\n",
  pgElse: "else pg = require('webpage').create();\n",
  pgOpen: "pg.open(url, steps.shift());\n",

  steps: "var steps = [\n${steps}\n];\n",
  step: "\nfunction(status) {\nif(status !== 'success') console.log('Network error');\nelse {\n${body}\n}}",

  visitFn: "var visit = function(url) {\n${body}\n};\n",
  visitCall: "visit('${url}');\n"

};
