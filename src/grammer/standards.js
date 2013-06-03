module.exports = {
  fn: "function ${nfe}(${args}) {\n${body}\n}${terminator}",
  autoEx: "(function ${nfe}(${args}) {\n${body}\n}(${passed}))${terminator}"
};
