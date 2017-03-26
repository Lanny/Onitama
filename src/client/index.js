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
      var gameState = new game.GameState(),
        svg = document.getElementById('game-board'),
        perspective = new Perspective(gameState, msg.color, svg);
    });

    socket.on('roleAssigned', function(msg) {
      console.info(`New watcher joined, color: ${ msg.color }`);
    });

    socket.emit('requestRole', { gameSessionId: window.onifig.gameSessionId });
  });
})();
