'use strict';

var gulp = require('gulp');
var traceur = require('gulp-traceur');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var coveralls = require('gulp-coveralls');
var jshint = require('gulp-jshint');

var paths = {
  scripts: 'lib/jasstor.js',
  tests: 'test/jasstorSpec.js',
  dist: 'dist/jasstor.js'
};

//Compiles ES6 into ES5
gulp.task('build', function () {
  return gulp.src(paths.scripts)
    .pipe(traceur({
      sourceMap: true
    }))
    .pipe(gulp.dest('dist'));
});

//Runs mocha test against compiled ES5 source code
gulp.task('test', ['build'], function () {
  return gulp.src(paths.tests)
    .pipe(mocha({
      reporter: 'spec'
    }));
});

//Runs mocha test ands submits coverage to coveralls.io
gulp.task('coverage', ['build'], function (cb) {
  gulp.src([paths.dist])
    .pipe(jshint())
    .pipe(istanbul())
    .on('finish', function () {
      gulp.src([paths.tests])
        .pipe(jshint())
        .pipe(mocha())
        .pipe(istanbul.writeReports())
        .on('end', cb);
    });
  gulp.src('coverage/lcov.info')
    .pipe(coveralls());
});

gulp.task('watch', function () {
  gulp.watch([paths.scripts, paths.tests], ['test']);
});
