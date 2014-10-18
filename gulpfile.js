'use strict';

var gulp = require('gulp');
var traceur = require('gulp-traceur');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var coveralls = require('gulp-coveralls');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var plumber = require('gulp-plumber');
var lazypipe = require('lazypipe');

var errorOccured = false;
var paths = {
  scripts: './lib/jasstor.js',
  tests: ['./test/jasstorClbkSpec.js', './test/jasstorPromiseSpec.js'],
  dist: './dist/jasstor.js'
};

//Submit coverage report to overalls.io
gulp.task('coveralls', ['test', 'checkError'], function () {
  return gulp.src('./coverage/lcov.info').pipe(coveralls());
});

//This task is here to exit from process with error code
//This way drone.io (CI server) knows that process failed
//It is needed because gulp-plumber forces 0 error code even when error occurs.
gulp.task('checkError', ['test'], function () {
  if (errorOccured) {
    console.log('Error occured, exitting build process... ');
    process.exit(1);
  }
});

var errorHandler = function () {
  console.log('Error occured... ');
  errorOccured = true;
};

var transpilePipe = lazypipe()
  .pipe(plumber, {
    errorHandler: errorHandler
  })
  .pipe(jshint)
  .pipe(jshint.reporter, stylish)
  .pipe(jshint.reporter, 'fail')
  .pipe(traceur);

//Compiles ES6 into ES5
gulp.task('build', function () {
  return gulp.src(paths.scripts)
    .pipe(plumber({
      errorHandler: errorHandler
    }))
    .pipe(transpilePipe())
    .pipe(gulp.dest('dist'));
});

//Transpile to ES5 and runs mocha test
gulp.task('test', ['build'], function (cb) {
  gulp.src([paths.dist])
    .pipe(plumber({
      errorHandler: errorHandler
    }))
    .pipe(istanbul())
    .on('finish', function () {
      gulp.src(paths.tests)
        .pipe(plumber({
          errorHandler: errorHandler
        }))
        .pipe(transpilePipe())
        .pipe(gulp.dest('tmp'))
        .pipe(mocha())
        .pipe(istanbul.writeReports())
        .on('end', cb);
    });
});

gulp.task('watch', function () {
  var filesToWatch = paths.tests.concat(paths.scripts);
  gulp.watch(filesToWatch, ['test']);
});

gulp.task('default', ['test', 'checkError', 'coveralls']);
