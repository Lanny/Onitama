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
        selection => selection.classed('game-row', true)
          .html('')
          .each((data, i, nodes) => {
            const el = d3.select(nodes[i]);
            el.append('td').text(data.name);
            el.append('td').text('N/A');
            el.append('td').text(data.state);
            el.append('td').text(data.spectators);
            el.append('td')
              .append('a')
              .text('Join')
              .classed('join-game', true)
              .attr('href', `/game/${data.id}`);
          }))

      rectify(gameTable, 'tr.no-games-row', msg.games.length?[]:[null],
        selection => selection
          .classed('no-games-row', true)
          .append('td')
          .attr('colspan', 5)
          .text('No current games.'));
    });

    socket.emit('requestGameList', {});
  });

})();
