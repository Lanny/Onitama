;(function() {
  require(['perspective'], function(Perspective) {
    var svg = document.getElementById('game-board');
    var perspective = new Perspective('WHITE', svg);
  });
})();
