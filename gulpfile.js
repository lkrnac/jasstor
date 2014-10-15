'use strict';

var gulp = require('gulp');
var traceur = require('gulp-traceur');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var coveralls = require('gulp-coveralls');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');

var paths = {
  scripts: './lib/jasstor.js',
  tests: ['./test/jasstorClbkSpec.js', './test/jasstorPromiseSpec.js'],
  dist: './dist/jasstor.js'
};

//Compiles ES6 into ES5
gulp.task('build', function () {
  return gulp.src(paths.scripts)
    .pipe(jshint())
    .pipe(jshint.reporter(stylish))
    .pipe(jshint.reporter('fail'))
    .pipe(traceur())
    .pipe(gulp.dest('dist'));
});

//Transpile to ES5 and runs mocha test
gulp.task('test', ['build'], function (cb) {
  gulp.src([paths.dist])
    .pipe(istanbul())
    .on('finish', function () {
      gulp.src(paths.tests)
        .pipe(jshint())
        .pipe(jshint.reporter(stylish))
        .pipe(jshint.reporter('fail'))
        .pipe(traceur())
        .pipe(gulp.dest('tmp'))
        .pipe(mocha())
        .pipe(istanbul.writeReports())
        .on('end', cb);
    });
});

//Submit coverage report to overalls.io
gulp.task('coveralls', ['test'], function () {
  return gulp.src('./coverage/lcov.info').pipe(coveralls({
    error: false
  }));
});

gulp.task('watch', function () {
  gulp.watch([paths.scripts, paths.tests], ['test']);
});

gulp.task('default', ['test', 'coveralls']);
