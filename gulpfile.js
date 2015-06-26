var gulp = require('gulp');
var args = require('yargs').argv;
var expand = require('./lib/src/utils/util').expand;
var replace = require('gulp-ext-replace');
var compile = require('./lib/gulp_plugins/compiler');
var jasmine = require('gulp-jasmine');
var exec = require('child_process').exec;
var glob = require('glob');

gulp.task('compile', function() {
  var path = expand('specs/${which}.spec', { which: args.spec });

  return gulp.src(path)
    .pipe(compile())
    .pipe(replace('.js'))
    .pipe(gulp.dest('lib/scripts'));
});

gulp.task('run', function() {
  var cmd = 'slimerjs ${path} --ssl-protocol=any';
  var cb = function(e, so, se) {
    if (e) console.log(e);
    else {
      so && console.log(so);
      se && console.log(se);
    }
  };
  var path;

  if (args.spec) {
    path = expand('lib/scripts/${which}.js', { which: args.spec });
    exec(expand(cmd, { path: path }), cb);

  } else {
    glob('lib/scripts/*.js', function(e, files) {
      if (e) console.log(e);
      else {
        files.forEach(function(file) {
          exec(expand(cmd, { path: file }), cb);
        });
      }
    });
  }
});

gulp.task('jasmine', function() {
  var str = 'lib/tests/${which}.js';
  var data = { which: args.spec ? args.spec : '*' };
  var path = expand(str, data);

  return gulp.src(path)
    .pipe(jasmine({verbose: true}));
});
