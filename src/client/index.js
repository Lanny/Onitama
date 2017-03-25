;(function() {
  requirejs.config({
    paths: {
      'socket.io': '/socket.io/socket.io'
    }
  });

  requirejs([
    'game',
    'perspective',
    'socket.io'
  ], function(game, Perspective, io) {
    var gameState = new game.GameState(),
      svg = document.getElementById('game-board'),
      perspective = new Perspective(gameState, 'WHITE', svg);

      var socket = io.connect();
  });
})();
