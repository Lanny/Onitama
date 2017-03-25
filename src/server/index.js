var requirejs = require('requirejs');

requirejs.config({
  nodeRequire: require
});

function wrap(express, http, socketIo, path, pug, GameSession) {
  const app = express(),
    server = http.Server(app),
    io = socketIo(server),
    templateCache = {};

  function getTemplate(name) {
    var templatePath = path.join(__dirname, '../assets/pug', name);

    if (!(templatePath in templateCache)) {
      templateCache[templatePath] = pug.compileFile(templatePath);
    }

    return templateCache[templatePath];
  }

  app.locals.gameSessions = {};

  app.use('/static', express.static(path.join(__dirname, '../../build/static')));
  
  app.get('/join-game', function(req, res) {
    for (let gid in app.locals.gameSessions) {
      if (app.locals.gameSessions[gid].isAwaitingPlayer()) {
        res.redirect(`/game/${gid}`);
        return;
      }
    }

    const gameSession = new GameSession();
    app.locals.gameSessions[gameSession.id] = gameSession;
    res.redirect(`/game/${gameSession.id}`);
  });

  app.get('/game/:id', function(req, res) {
    const session = app.locals.gameSessions[req.params.id];

    if (session === undefined) {
      res.status(404).send('No such game');
      return;
    }

    const response = getTemplate('game.pug')({ session });
    res.send(response);
  });

  io.on('connection', function(socket){
    console.log('a user connected');
  });

  server.listen(3000, function () {
    console.log('Listening on port 3000');
  });
}

requirejs([
  'express',
  'http',
  'socket.io',
  'path',
  'pug',
  'game-session'
], wrap);
