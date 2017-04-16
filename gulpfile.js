var gulp = require('gulp');
var del = require('del');
var nodemon = require('gulp-nodemon');
var babel = require('gulp-babel');
var argv = require('yargs').argv;

var Jasmine = require('jasmine');
var through = require('through2');

var testFiles = ['src/test/*-spec.js'],
  jsFiles = ['src/client/*.js', 'src/isomorphic/*.js'].concat(testFiles),
  svgFiles = ['src/assets/svg/*.svg'],
  cssFiles = ['src/assets/css/*.css'],
  mp3Files = ['src/assets/mp3/*.mp3'];

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

gulp.task('mp3', function() {
  return gulp.src(mp3Files)
    .pipe(gulp.dest('build/static/mp3'));
});

gulp.task('svg', function() {
  return gulp.src(svgFiles)
    .pipe(gulp.dest('build/static/svg'));
});

gulp.task('css', function() {
  return gulp.src(cssFiles)
    .pipe(gulp.dest('build/static/css'));
});

gulp.task('generate', ['js', 'svg', 'css', 'mp3'], function() { });

gulp.task('server', ['generate'], function() {
  gulp.watch(jsFiles, ['js']);
  gulp.watch(svgFiles, ['svg']);
  gulp.watch(cssFiles, ['css']);

  return nodemon({
    script: 'src/server/index.js',
    ext: 'js,pug',
    watch: [
      'src/server/',
      'src/isomorphic/',
      'src/assets/pug/'
    ]
  });
});

gulp.task('_test', function() {
  var jasmine = new Jasmine();
  var path = require('path');
  var specs = [];
  var alreadyCached = {};
  var moduleName;

  for (moduleName in require.cache) {
    alreadyCached[moduleName] = null;
  }

  var requirejs = require('requirejs');

  requirejs.config({
    nodeRequire: require,
    baseUrl: path.join(__dirname, 'src/server'),
    paths: {
      'game': '../isomorphic/game',
      'colors': '../isomorphic/colors',
      'cards': '../isomorphic/cards',
      'utils': '../isomorphic/utils',
      'mocket': '../test/mocket'
    }
  });

  requirejs.onError = function(err) {
    console.error('Error encoutered during module loading for test:');
    console.error(err);
  };

  gulp.src(testFiles)
    .pipe(through.obj(function(file, enc, cb) {
      specs.push(file.path);
      cb(null, file);
    }, function(cb) {
      requirejs(specs, function() {
        jasmine.onComplete(function (passed) {
          cb();
        });

        jasmine.execute();

        // Clear cache of any modules loaded during test.
        for (moduleName in require.cache) {
          if (!(moduleName in alreadyCached)) {
            delete require.cache[moduleName];
          }
        }
      });
    }));
});

gulp.task('test:watch', ['_test'], function() {
  gulp.watch(jsFiles, ['_test']);
});

gulp.task('test:once', ['_test'], function() { });
