;(function() {
  function wrap(d3) {
    function extractTagType(selector) {
      var els = selector.split(/[> ]/g),
        tag = els[els.length-1],
        tagName = tag.split(/[#\.]/)[0];

      return tagName;
    }

    function rectify(parent, selector, data, applyProps) {
      var elements = parent
        .selectAll(selector)
        .data(data);

      elements
        .exit()
        .remove();

      var enterSelection = elements
        .enter()
        .append(extractTagType(selector));

      applyProps(enterSelection);
      applyProps(elements);
    }

    function drawGrid(g, fill='none') {
      g.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 100)
        .attr('height', 100)
        .attr('fill', fill)
        .attr('stroke', 'black')
        .attr('stroke-width', 1);

      g.selectAll('line.vert-line')
        .data(d3.range(1,5))
        .enter()
        .append('line')
        .classed('vert-line', true)
        .attr('x1', function(d) { return d*20; })
        .attr('x2', function(d) { return d*20; })
        .attr('y1', function(d) { return 0; })
        .attr('y2', function(d) { return 100; })
        .attr('stroke', 'black')
        .attr('stroke-width', 1);

      g.selectAll('line.horz-line')
        .data(d3.range(1,5))
        .enter()
        .append('line')
        .classed('horz-line', true)
        .attr('y1', function(d) { return d*20; })
        .attr('y2', function(d) { return d*20; })
        .attr('x1', function(d) { return 0; })
        .attr('x2', function(d) { return 100; })
        .attr('stroke', 'black')
        .attr('stroke-width', 1);

      return g;
    }

    function drawCard(container, card) {
      const border = 12.5;

      container.classed('card', true);

      rectify(container, 'rect.background', [card],
        selection => selection
          .classed('background', true)
          .attr('width', 250)
          .attr('height', 125)
          .attr('fill', 'white')
          .attr('stroke', 'black')
          .attr('stroke-width', 1));

      rectify(container, 'g.move-grid', [card],
        selection => selection
          .classed('move-grid', true)
          .attr('transform', `translate(${border},${border})`)
          .call(drawGrid));

      var moveGrid = container.select('g.move-grid');

      rectify(moveGrid, 'rect.position', card.getMoves(),
        selection => selection
          .classed('position', true)
          .attr('x', d => (2-d[0])*20 )
          .attr('y', d => (2-d[1])*20 )
          .attr('width', 20)
          .attr('height', 20)
          .attr('fill', 'grey'));

      rectify(moveGrid, 'rect.border', [card],
        selection => selection
          .classed('border', true)
          .attr('x', 40)
          .attr('y', 40)
          .attr('width', 20)
          .attr('height', 20)
          .attr('fill', 'black'));

      rectify(container, 'text.card-caption', [card],
        selection => selection
          .classed('card-caption', true)
          .text(function(d) { return d.name; })
          .attr('text-anchor', 'middle')
          .attr('x', 175)
          .attr('y', 65));
    }

    return {
      rectify,
      drawGrid,
      drawCard
    };
  }

  define(['d3'], wrap)
})();

