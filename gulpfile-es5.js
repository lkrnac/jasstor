'use strict';

var gulp = require('gulp');
var mocha = require('gulp-mocha');
var plumber = require('plumber');

var exec = require('child_process').exec;

//This task build in separate process to ensure that
//Traceur runtime is undefined for upcoming ES5 test
gulp.task('build', function (cb) {
  exec('gulp build', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
});

gulp.task('default', ['build'], function(){
  return gulp.src('./test/es5Spec.js')
    .pipe(plumber())
    .pipe(mocha({
      reporter: 'spec'
    }));
});
