module.exports = {
  // string interp via ${}
  expand: function(str, data) {
    return str.replace(/\$\{(\S+?)\}/g,
      function(match, key) { return data[key]; }
    );
  }
};
