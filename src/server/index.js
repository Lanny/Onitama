var requirejs = require('requirejs');

requirejs.config({
  nodeRequire: require
});

function wrap(path, express) {
  var app = express();

  app.use('/static', express.static(path.join(__dirname, '../../build/static')));

  app.listen(3000, function () {
    console.log('Listening on port 3000');
  });
}

requirejs([
  'path',
  'express',
], wrap);
