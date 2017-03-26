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
    'colors'
  ], function(io, game, Perspective, {WHITE, BLACK}) {
    const socket = io.connect();

    socket.on('->assignRole', function(msg) {
      const gameState = new game.GameState();
      gameState.loadState(msg.gameState);

      const svg = document.getElementById('game-board'),
        perspective = new Perspective(gameState, msg.color, svg);
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
    });

    socket.emit('requestRole', { gameSessionId: window.onifig.gameSessionId });
  });
})();
