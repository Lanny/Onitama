;(function() {
  require([
    'game',
    'perspective'
  ], function(game, Perspective) {
    var gameState = new game.GameState(),
      svg = document.getElementById('game-board'),
      perspective = new Perspective(gameState, 'BLACK', svg);
  });
})();
