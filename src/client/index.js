;(function() {
  requirejs.config({
    paths: {
      'socket.io': '/socket.io/socket.io'
    }
  });

  requirejs([
    'socket.io',
    'game',
    'perspective',
    'cards',
    'colors'
  ], function(io, game, Perspective, cards, {WHITE, BLACK}) {
    const socket = io.connect();
    var gameState;

    socket.on('->assignRole', function(msg) {
      gameState = new game.GameState().loadState(msg.gameState);

      const svg = document.getElementById('game-board'),
        perspective = new Perspective(gameState, msg.color, svg, socket);
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
      console.info(`New watcher joined, color: ${ msg.color }`);
    });

    socket.on('gameStarted', function(msg) {
      console.info('Both players are present, the game begins.');
      gameState.start();
    });

    socket.on('moveAccepted', function(msg) {
      console.info('Last move was accepted by the server.');
    });

    socket.on('moveMade', function(msg) {
      console.info('Received a new move from the server', msg);
      const card = gameState.localizeCard(msg.card);

      gameState.executeMove(
        msg.initialPosition,
        msg.targetPosition,
        card);
    });

    socket.on('applicationError', function(msg) {
      console.error('Application error!', msg);
    });

    socket.emit('requestRole', { gameSessionId: window.onifig.gameSessionId });
  });

})();
