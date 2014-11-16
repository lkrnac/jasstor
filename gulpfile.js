'use strict';

var gulp = require('gulp');
var lazypipe = require('lazypipe');
var plugins = require('gulp-load-plugins')();

require('gulp-grunt')(gulp);

var errorOccured = false;
var paths = {
  scriptsPromise: './lib/jasstor.js',
  scriptsClbk: './lib/jasstorClbk.js',
  tests: ['./test/jasstorPromiseSpec.js', './test/jasstorClbkSpec.js'],
  dist: './dist/jasstor.js'
};

//Submit coverage report to overalls.io
gulp.task('coveralls', ['test', 'checkError'], function () {
  return gulp.src('./coverage/lcov.info').pipe(plugins.coveralls());
});

//This task is here to exit from process with error code
//This way drone.io (CI server) knows that process failed
//It is needed because gulp-plumber forces 0 error code even when error occurs.
gulp.task('checkError', ['test'], function () {
  if (errorOccured) {
    console.log('Err, distor occured, exitting build process... ');
    process.exit(1);
  }
});

var errorHandler = function () {
  console.log('Error occured... ');
  errorOccured = true;
};

var transpilePipe = lazypipe()
  .pipe(plugins.plumber, {
    errorHandler: errorHandler
  })
  .pipe(plugins.jshint)
  .pipe(plugins.jshint.reporter, plugins.stylish)
  .pipe(plugins.jshint.reporter, 'fail')
  .pipe(plugins.traceur);

var registerBuildTask = function (taskNameSuffix, paths) {
  //Compiles ES6 into ES5
  gulp.task('build' + taskNameSuffix, function () {
    return gulp.src(paths)
      .pipe(plugins.plumber({
        errorHandler: errorHandler
      }))
      .pipe(transpilePipe())
      .pipe(plugins.rename('jasstor.js'))
      .pipe(gulp.dest('dist'));
  });
};

gulp.task('testClbk', ['buildCallback'], function () {
  gulp.src(paths.tests)
    .pipe(plugins.plumber({
      errorHandler: errorHandler
    }))
    .pipe(transpilePipe())
    .pipe(gulp.dest('tmp'))
    .pipe(plugins.mocha());
});

//Transpile to ES5 and runs mocha test
gulp.task('test', ['buildPromise'], function (cb) {
  gulp.src([paths.dist])
    .pipe(plugins.plumber({
      errorHandler: errorHandler
    }))
    .pipe(plugins.istanbul())
    .on('finish', function () {
      gulp.src(paths.tests)
        .pipe(plugins.plumber({
          errorHandler: errorHandler
        }))
        .pipe(transpilePipe())
        .pipe(gulp.dest('tmp'))
        .pipe(plugins.mocha())
        .pipe(plugins.istanbul.writeReports())
        .on('end', cb);
    });
});

gulp.task('watch', function () {
  var filesToWatch = paths.tests.concat(paths.scriptsPromise);
  gulp.watch(filesToWatch, ['test']);
});

registerBuildTask('Promise', paths.scriptsPromise);
registerBuildTask('Callback', paths.scriptsClbk);

gulp.task('default', ['test', 'checkError', 'coveralls']);
gulp.task('build', ['test', 'checkError']);
gulp.task('release', ['build', 'grunt-release']);
