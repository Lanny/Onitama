var gulp = require('gulp');
var del = require('del');
var nodemon = require('gulp-nodemon');
var babel = require('gulp-babel');
var argv = require('yargs').argv;

var jsFiles = ['src/client/*.js', 'src/isomorphic/*.js'],
  svgFiles = ['src/assets/svg/*.svg'];

gulp.task('clean', function() {
  return del('build');
});

gulp.task('js', function() {
  var pipeLine = gulp.src(jsFiles);

  if (argv.production) {
    pipeLine = pipeLine.pipe(babel({ presets: ['es2015'] }));
  }

  return pipeLine.pipe(gulp.dest('build/static/js'));
});

gulp.task('svg', function() {
  return gulp.src(svgFiles)
    .pipe(gulp.dest('build/static/svg'));
});

gulp.task('generate', ['js', 'svg'], function() { });

gulp.task('server', ['generate'], function() {
  gulp.watch(jsFiles, ['js']);
  gulp.watch(svgFiles, ['svg']);

  return nodemon({
    script: 'src/server/index.js',
    ext: 'js,pug',
    watch: ['src/server/', 'src/assets/pug/']
  });
});
