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
    lobbyNS = io.of('/sockets/lobby'),
    gameNS = io.of('/sockets/game'),
    templateCache = {},
    GA_UA = process.env.GA_UA || null,
    PORT = process.env.PORT || 3000,
    RETENTION_TIME = process.env.RETENTION_TIME || 60,
    POLL_FREQUENCY = process.env.POLL_FREQUENCY || 60;

  app.locals.gameSessions = {};

  function getTemplate(name) {
    var templatePath = path.join(__dirname, '../assets/pug', name);

    if (!(templatePath in templateCache)) {
      templateCache[templatePath] = pug.compileFile(templatePath);
    }

    return templateCache[templatePath];
  }

  function serializeGameList() {
    const games = [];
    for (let gameId in app.locals.gameSessions) {
      const gameSession = app.locals.gameSessions[gameId];
      games.push({
        id: gameSession.id,
        name: gameSession.getName(),
        spectators: gameSession.getSpectators(),
        state: gameSession.getState()
      });
    }

    return games;
  }

  function updateGameList() {
    lobbyNS.emit('gameList', { games: serializeGameList() });
  }

  app.use('/static', express.static(path.join(__dirname, '../../build/static')));

  app.get('/', function(req, res) {
    const response = getTemplate('lobby.pug')({ ga_ua: GA_UA });
    res.send(response);
  });
  
  app.get('/create-game', function(req, res) {
    const gameSession = new GameSession();
    app.locals.gameSessions[gameSession.id] = gameSession;

    updateGameList();
    gameSession.onStateChange(() => updateGameList());

    res.redirect(`/game/${gameSession.id}`);
  });

  app.get('/game/:id', function(req, res) {
    const session = app.locals.gameSessions[req.params.id];

    if (session === undefined) {
      res.status(404).send('No such game');
      return;
    }

    const response = getTemplate('game.pug')({
      session,
      ga_ua: GA_UA
    });
    res.send(response);
  });

  lobbyNS.on('connection', function(socket) {
    socket.on('requestGameList', function() {
      socket.emit('gameList', {
        games: serializeGameList()
      });
    });
  });

  gameNS.on('connection', function(socket) {
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

      participant = session.acceptParticipant(socket, msg.name);
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
    // Poll for inactive games
    setInterval(function() {
      var session,
        somethingChanged = false;

      console.log('Sweeping for inactive game sessions.');

      for (let key in app.locals.gameSessions) {
        session = app.locals.gameSessions[key];

        if (session.terminatedAt &&
            Date.now() - session.terminatedAt > RETENTION_TIME * 1000) {
          console.log(`Game session ${session.id} inactive, removing.`);
          session.lastCall();
          delete app.locals.gameSessions[key];
          somethingChanged = true;
        }
      }

      if (somethingChanged) {
        console.log('Issuing updated game list after update');
        updateGameList();
      }
    }, POLL_FREQUENCY * 1000);

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
