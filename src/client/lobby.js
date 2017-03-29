;(function() {
  requirejs.config({
    paths: {
      'socket.io': '/socket.io/socket.io'
    }
  });

  requirejs([
    'socket.io',
    'd3',
    'client-utils'
  ], function(io, d3, {rectify}) {
    const socket = io.connect('/sockets/lobby'),
      gameTable = d3.select('#game-table');

    socket.on('gameList', function(msg) {
      d3.select('tr.loading').remove();

      rectify(gameTable, 'tr.game-row', msg.games,
        selection => selection.each((data, i, nodes) => {
          const el = d3.select(nodes[i]);
          el.append('td').text(data.name);
          el.append('td').text('N/A');
          el.append('td').text(data.state);
          el.append('td').text(data.spectators);
          el.append('td').text('CTA!');
        }))
    });

    socket.emit('requestGameList', {});
  });

})();
