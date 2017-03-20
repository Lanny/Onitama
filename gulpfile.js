var gulp = require('gulp');
var del = require('del');
var nodemon = require('gulp-nodemon');
var babel = require('gulp-babel');

var jsFiles = ['src/client/*.js', 'src/isomorphic/*.js'],
  svgFiles = ['src/assets/svg/*.svg'],
  htmlFiles = ['src/assets/html/*.html'];

gulp.task('clean', function() {
  return del('build');
});

gulp.task('js', function() {
  return gulp.src(jsFiles)
    .pipe(babel({ presets: ['es2015'] }))
    .pipe(gulp.dest('build/static/js'));
});

gulp.task('svg', function() {
  return gulp.src(svgFiles)
    .pipe(gulp.dest('build/static/svg'));
});

gulp.task('html', function() {
  return gulp.src(htmlFiles)
    .pipe(gulp.dest('build/static'));
});

gulp.task('generate', ['js', 'svg', 'html'], function() { });

gulp.task('server', ['generate'], function() {
  gulp.watch(jsFiles, ['js']);
  gulp.watch(svgFiles, ['svg']);
  gulp.watch(htmlFiles, ['html']);

  return nodemon({
    script: 'src/server/index.js',
    watch: 'src/server/'
  });
});
