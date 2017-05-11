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

function wrap(
    process,
    express,
    bodyParser,
    http,
    socketIo,
    path,
    pug,
    cards,
    GameSession,
    ApplicationError,
    {WHITE, BLACK}) {
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

  function validateNewGameParams(params) {
    var options = {};

    if (params.name && params.name.length) {
      options.name = params.name.substring(0, 128);
    }

    if (!Array.isArray(params['card-id'])) {
      throw new ApplicationError('Must provide `card-name` options', 'FORM');
    }

    const cardIds = new Set(params['card-id']);
    options.deck = cards.deck.filter(c => cardIds.has(c.getId()));

    if (options.deck.length < 5) {
      throw new ApplicationError('Insufficient number of cards selected.', 'FORM');
    }

    return options;
  }

  app.use('/static', express.static(path.join(__dirname, '../../build/static')));
  app.use(bodyParser.urlencoded({ extended:  true }));

  app.get('/', function(req, res) {
    const response = getTemplate('lobby.pug')({ ga_ua: GA_UA });
    res.send(response);
  });
  
  app.get('/new-game', function(req, res) {
    const response = getTemplate('new-game.pug')();
    res.send(response);
  });

  app.post('/new-game', function(req, res) {
    const options = validateNewGameParams(req.body),
      gameSession = new GameSession(null, options);

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

    function requireRole() {
      if (session === null || participant === null) {
        throw new ApplicationError(
          'Game session or participant records missing.',
          'INVALID_SEQUENCE');
      }
    }

    function acquireSession(sessionId) {
      if (session !== null) {
        throw new ApplicationError(
          'role assignment request received when role has already been assigned',
          'INVALID_SEQUENCE');
      }

      session = app.locals.gameSessions[sessionId];

      if (!session) {
        throw new ApplicationError(
          `no such game: ${sessionId}`,
          'INVALID_SEQUENCE');
      }

      return session;
    }

    on('requestRole', function(msg) {
      acquireSession(msg.gameSessionId);
      participant = session.acceptParticipant(socket, msg.name, msg.joinCode);
    });

    on('requestRejoin', function(msg) {
      acquireSession(msg.gameSessionId);
      participant = session.attemptRejoin(socket, msg.rejoinCode);
    });

    on('->makeMove', function(msg) {
      requireRole();
      session.submitMove(msg, participant);
    });

    on('->proposeRematch', function(msg) {
      requireRole();

      if (participant.color !== WHITE && participant.color !== BLACK) {
        throw new ApplicationError('Non-player proposed a rematch. Error.');
      }

      if (!session.gameState.terminated) {
        throw new ApplicationError(
          'Game isn\'t finished yet, rematch not permitted');
      }

      participant.rematchAccepted = true;

      if (session.black.rematchAccepted && session.white.rematchAccepted) {
        const gameSession = new GameSession(session);
        app.locals.gameSessions[gameSession.id] = gameSession; 

        updateGameList();
        gameSession.onStateChange(() => updateGameList());

        session.black.emit('->rematch', {
          newUrl: `/game/${gameSession.id}?jc=${gameSession.whiteJoinCode}`
        });

        session.white.emit('->rematch', {
          newUrl: `/game/${gameSession.id}?jc=${gameSession.blackJoinCode}`
        });

        session.observers
          .filter(o => o !== session.white && o !== session.black)
          .forEach(o => {
            o.emit('rematch', { newUrl: `/game/${gameSession.id}` });
          });
      } else {
        session.broadcast(participant, 'rematchProposed', {
          proposerName: participant.name,
          proposerId: participant.id,
          proposerColor: participant.color
        });
      }
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
  'body-parser',
  'http',
  'socket.io',
  'path',
  'pug',
  'cards',
  'game-session',
  'application-error',
  'colors'
], wrap);
