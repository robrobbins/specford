var gulp = require('gulp');
var args = require('yargs').argv;
var expand = require('./src/utils/util').expand;
var replace = require('gulp-ext-replace');
var compile = require('./gulp_plugins/compiler');
var jasmine = require('gulp-jasmine');

gulp.task('compile', function() {
  var str = 'spec/${which}.spec';
  var data = { which: args.spec ? args.spec : '*' };
  var path = expand(str, data);

  return gulp.src(path)
    .pipe(compile())
    .pipe(replace('.js'))
    .pipe(gulp.dest('scripts'));
});

gulp.task('jasmine', function () {
  var str = 'specs/${which}.js';
  var data = { which: args.spec ? args.spec : '*' };
  var path = expand(str, data);

  return gulp.src(path)
    .pipe(jasmine({verbose: true}));
});
