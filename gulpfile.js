var gulp = require('gulp');
var del = require('del');

gulp.task('clean', function() {
  return del('build');
});

gulp.task('js', function() {
  return gulp.src(['src/client/*.js', 'src/isomorphic/*.js'])
    .pipe(gulp.dest('build/static/js'));
});

gulp.task('svg', function() {
  return gulp.src('src/assets/svg/*.svg')
    .pipe(gulp.dest('build/static/svg'));
});

gulp.task('html', function() {
  return gulp.src('src/assets/html/*.html')
    .pipe(gulp.dest('build/static'));
});

gulp.task('generate', ['js', 'svg', 'html'], function() {
});
