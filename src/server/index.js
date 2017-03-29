var requirejs = require('requirejs');

requirejs.config({
  nodeRequire: require,
  paths: {
    'game': '../isomorphic/game',
    'colors': '../isomorphic/colors',
    'cards': '../isomorphic/cards',
    'utils': '../isomorphic/utils'
  }
});

function wrap(process, express, http, socketIo, path, pug, GameSession, ApplicationError) {
  const app = express(),
    server = http.Server(app),
    io = socketIo(server),
    templateCache = {},
    PORT = process.env.PORT || 3000;

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
      if (app.locals.gameSessions[gid].isAwaitingParticipant()) {
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
    var session = null,
      participant = null;

    function on(event, handler) {
      socket.on(event, (...handlerArgs) => {
        try {
          handler(...handlerArgs);
        } catch (e) {
          if (e instanceof ApplicationError) {
            socket.emit('applicationError', e.event);
          } else {
            throw e;
          }
        }
      });
    }

    on('requestRole', function(msg) {
      if (session !== null) {
        throw new ApplicationError(
          'requestRole received when role has already been assigned',
          'INVALID_SEQUENCE');
      }

      session = app.locals.gameSessions[msg.gameSessionId];

      if (!session) {
        throw new ApplicationError(
          `no such game: ${msg.gameSessionId}`,
          'INVALID_SEQUENCE');
      }

      participant = session.acceptParticipant(socket);
    });

    on('->makeMove', function(msg) {
      if (session === null || participant === null) {
          throw new ApplicationError(
            'Game session or participant records missing.',
            'INVALID_SEQUENCE');
      }

      session.submitMove(msg, participant);
    });
  });

  server.listen(PORT, function () {
    console.log(`Listening on port ${PORT}`);
  });
}

requirejs([
  'process',
  'express',
  'http',
  'socket.io',
  'path',
  'pug',
  'game-session',
  'application-error'
], wrap);
