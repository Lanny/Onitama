;(function() {
  function wrap(d3, game) {
    function Perspective(gameState, color, svg) {
      this.gameState = gameState;
      this.color = color;
      this.svg = d3.select(svg);

      this._b = (this.color === 'WHITE') ? 0 : 4;
      this._m = (this.color === 'WHITE') ? 1 : -1;

      this.renderGridLines();
      this.renderPieces();
    }

    Perspective.prototype = {
      _gridXToSvgX: function(gridX) {
        return (gridX-this._b) * this._m * 20 + 10;
      },
      _gridYToSvgY: function(gridY) {
        return (gridY-this._b) * this._m * 20 + 10;
      },
      renderGridLines: function() {
        var self = this;

        var gridLines = self.svg
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
      },
      renderPieces: function() {
        var self = this;

        var piecesContainer = self.svg
          .append('g')
          .classed('pieces', true);

        piecesContainer.selectAll('image.piece')
          .data(self.gameState.getPieces())
          .enter()
          .append('image')
          .attr('width', 15)
          .attr('height', 15)
          .attr('x', function(d) { return self._gridXToSvgX(d.x) - 7.5; })
          .attr('y', function(d) { return self._gridYToSvgY(d.y) - 7.5; })
          .attr('href', function(d) { return d.piece.getSvgPath(); });

      }
    };

    return Perspective;
  }

  define([
    'd3',
    'game'
  ], wrap);
})();
