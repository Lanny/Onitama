;(function() {
  requirejs.config({
    paths: {
      'socket.io': '/socket.io/socket.io'
    }
  });

  requirejs([
    'socket.io',
    'd3',
    'game',
    'perspective',
    'cards',
    'logger',
    'chat',
    'utils',
    'storage-manager',
    'colors'
  ], function(io, d3, game, Perspective, cards, Logger, Chat, utils, storage, {WHITE, BLACK}) {
    const socket = io.connect('/sockets/game'),
      logger = new Logger(document.getElementById('log-lines')),
      chat = new Chat(document.getElementById('chat-box'), socket, logger),
      rejoinKey = 'rejoin-' + window.onifig.gameSessionId;

    var roleRequested = false,
      gameState = null;

    function bindSocketListeners(socket) {
      socket.on('->assignRole', function(msg) {
        gameState = new game.GameState().loadState(msg.gameState);

        const svg = document.getElementById('game-board'),
          perspective = new Perspective(gameState, msg.color, svg, socket, logger);

        storage.set(rejoinKey, msg.rejoinCode);

        logger.setPerspective(perspective);
        logger.info(`Joined game as ${ utils.niceName(msg.color) }.`);

        d3.select('.landing-screen').style('display', 'none');
        d3.select('.game-container').style('display', 'flex');
      });

      socket.on('participantDisconnected', function(msg) {
        if (msg.color === WHITE) {
          console.info('White has abandoned the game.');
        } else if (msg.color === BLACK) {
          console.info('Black has abandoned the game.');
        } else {
          console.info('An observer has stopped watching the game.');
        }
      });

      socket.on('roleAssigned', function(msg) {
        logger.info(`${ msg.name } has joined the game as ${ utils.niceName(msg.color) }.`);
      });

      socket.on('gameStarted', function(msg) {
        logger.info('Both players are present, the game begins.');
        gameState.start();
      });

      socket.on('moveAccepted', function(msg) {
        console.info('Last move was accepted by the server.');
      });

      socket.on('moveMade', function(msg) {
        const card = gameState.localizeCard(msg.card),
          color = gameState.getCellContents(...msg.initialPosition).getColor();

        logger.logMove(`The ${ utils.niceName(color) } player moved from ${ utils.niceCoords(msg.initialPosition) } to ${ utils.niceCoords(msg.targetPosition) } by playing the ${ card.name } card.`, msg);

        gameState.executeMove(
          msg.initialPosition,
          msg.targetPosition,
          card);
      });

      socket.on('gameTerminated', function(msg) {
        gameState.terminate();
        logger.info(`Game concluded because ${ msg.reason }`);
      });

      socket.on('rematchProposed', function(msg) {
        logger.info(`${msg.proposerName} has proposed a rematch. Click the "rematch" button to accept.`);
      });

      socket.on('->rematch', function(msg) {
        window.location.assign(msg.newUrl);
      });

      socket.on('rematch', function(msg) {
        window.location.assign(msg.newUrl);
      });

      socket.on('disconnect', function(msg) {
        logger.info('Disconnected...');
      });

      socket.on('applicationError', function(msg) {
        logger.error('Application error!' + msg);
      });
    }

    function bindJoinScreenLogic(socket) {
      d3.select('#name-form').on('submit', function() {
        d3.event.preventDefault();

        if (roleRequested) {
          return;
        }

        const name = d3.select('#name').node().value;
        logger.info('Joining game...');

        socket.emit('requestRole', {
          gameSessionId: window.onifig.gameSessionId,
          name: name
        });

        storage.set('lastUserName', name, 1000*60*60*24*28);
        roleRequested = true;
      });


      d3.select('#rejoin-button').on('click', function() {
        d3.event.preventDefault();

        if (roleRequested) {
          return;
        }

        socket.emit('requestRejoin', {
          gameSessionId: window.onifig.gameSessionId,
          rejoinCode: rejoinCode
        });
        roleRequested = true;
      });

      const lastUserName = storage.get('lastUserName');
      if (lastUserName) {
        d3.select('#name').node().value = lastUserName;
      }

      const rejoinCode = storage.get(rejoinKey);
      if (rejoinCode) {
        d3.select('.rejoin').style('display', 'block');
      }
    }

    bindSocketListeners(socket);

    // Do we have a joincode (distinct from rejoin codes)? If so skip name
    // entry join screen and immidately enter game
    var query = utils.parseUrl(document.location.href).query;

    if (query && query.jc && query.jc.length) {
      // We do!
      socket.emit('requestRole', {
        gameSessionId: window.onifig.gameSessionId,
        name: storage.get('lastUserName') || 'scrub (something\'s wrong)',
        joinCode: query.jc[0]
      });
      console.log('EMIT!');
      roleRequested = true;
    } else {
      // We don't, go through normal join path
      bindJoinScreenLogic(socket);
    }
  });

})();
