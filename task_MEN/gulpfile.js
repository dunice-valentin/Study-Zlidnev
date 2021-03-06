var nodemon = require('gulp-nodemon'),
    livereload = require('gulp-livereload');

var gulp = require('gulp'),
    less = require('gulp-less'),
    minifyCSS = require("gulp-minify-css"),
    concat = require("gulp-concat"),
    rename = require("gulp-rename");

var del = require("del");

gulp.task('less', function () {
  gulp.src('./public/css/*.less')
    .pipe(less())
    .pipe(gulp.dest('./public/css'))
    .pipe(livereload());
});

gulp.task('watch', function() {
  gulp.watch('./public/css/*.less', ['less', ]);
});

gulp.task('develop', function () {
  livereload.listen();
  nodemon({
    script: 'bin/www',
    ext: 'js jade',
  }).on('restart', function () {
    setTimeout(function () {
      livereload.changed();
    }, 1000);
  });
});

gulp.task('default', [
  'less',
  'develop',
  'watch'
]);
