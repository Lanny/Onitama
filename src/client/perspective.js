;(function() {
  function wrap(d3) {
    function Perspective(gameState, color, svg) {
      this.gameState = gameState;
      this.color = color;
      this.svg = d3.select(svg);

      this._perspectiveCoords = [];
      this._cells = [];
      var b = (this.color === 'WHITE') ? 0 : 4,
        m = (this.color === 'WHITE') ? 1 : -1;

      for (var x=0; x<5; x++) {
        this._perspectiveCoords[x] = [];

        for (var y=0; y<5; y++) {
          this._perspectiveCoords[x][y] = [(x-b)*m, (y-b)*m];
          this._cells.push([x,y]);
        }
      }

      this.renderGridLines();
    }

    Perspective.prototype = {
      renderGridLines: function() {
        var gridLines = this.svg
          .attr('viewBox', '-1 -1 102 102')
          .append('g')
          .classed('grid-lines', true);

        gridLines.selectAll('line.vert-line')
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

        gridLines.selectAll('line.horz-line')
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

        gridLines.append('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', 100)
          .attr('height', 100)
          .attr('fill', 'none')
          .attr('stroke', 'black')
          .attr('stroke-width', 1);

      }
    };

    return Perspective;
  }

  define(['d3'], wrap);
})();
