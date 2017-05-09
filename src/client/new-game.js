;(function() {
  requirejs.config({
    paths: {
      'socket.io': '/socket.io/socket.io'
    }
  });

  requirejs([
    'd3',
    'cards',
    'client-utils'
  ], function(d3, cards, {rectify, drawCard}) {
    const cardList = d3.select('#card-select-list');

    rectify(cardList, 'li', cards.deck,
      selection => selection.each((data, i, nodes) => {
        const el = d3.select(nodes[i]);
        const svg = el.append('svg')
          .attr('viewBox', '0 0 250 125')
          .style('width', '250px');

        drawCard(svg, data);
      }));
  });
})();
