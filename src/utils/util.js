module.exports = {
  // string interp via ${}
  expand: function(str, data) {
    return str.replace(/\$\{(\S+?)\}/g,
      function(match, key) { return data[key]; }
    );
  },

  // given a dot delimited string, traverse the `obj` to that refinement and
  // return the value found there
  getPath: function(path, obj) {
    var p = path.split('.'), key;
    for (; p.length && (key = p.shift());) {
      if(!p.length) return obj[key];
      else obj = obj[key] || {};
    }
    return obj;
  }
};
