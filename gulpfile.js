'use strict';

var gulp = require('gulp');
var traceur = require('gulp-traceur');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var coveralls = require('gulp-coveralls');

//Compiles ES6 into ES5
gulp.task('build', function () {
  return gulp.src('lib/jasstor.js')
    .pipe(traceur({
      sourceMap: true
    }))
    .pipe(gulp.dest('dist'));
});

//Runs mocha test against compiled ES5 source code
gulp.task('test', ['build'], function () {
  return gulp.src('test/jasstorSpec.js')
    .pipe(mocha({
      reporter: 'spec'
    }));
});

//Runs mocha test ands submits coverage to coveralls.io
gulp.task('coverage', ['build'], function (cb) {
  gulp.src(['dist/jasstor.js'])
    .pipe(istanbul()) // Covering files
  .on('finish', function () {
    gulp.src(['test/jasstorSpec.js'])
      .pipe(mocha())
    // Creating the reports after tests runned
    .pipe(istanbul.writeReports())
      .on('end', cb);
  });
  gulp.src('coverage/lcov.info')
    .pipe(coveralls());
});
