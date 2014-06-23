'use strict';

var gulp = require('gulp');
var traceur = require('gulp-traceur');
var mocha = require('gulp-mocha');

gulp.task('build', function () {
  return gulp.src('lib/jasstor.js')
    .pipe(traceur({sourceMap: true}))
    .pipe(gulp.dest('dist'));
});

gulp.task('test', function(){
  return gulp.src('test/jasstorSpec.js')
    .pipe(mocha({reporter: 'spec'}));
});
