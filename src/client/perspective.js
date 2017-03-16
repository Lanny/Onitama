;(function() {
  function wrap(d3, game) {
    function drawGrid(g) {
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

      g.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 100)
        .attr('height', 100)
        .attr('fill', 'none')
        .attr('stroke', 'black')
        .attr('stroke-width', 1);

      return g;
    }

    function drawCard(g, card, flipped) {
      var border = 12.5;

      g.attr('transform', 'scale(0.16)')
        .append('rect')
        .attr('width', 250)
        .attr('height', 125)
        .attr('fill', 'none')
        .attr('stroke', 'black')
        .attr('stroke-width', 1);

      var moveGrid = g.append('g')
        .attr('transform', 'translate('+border+','+border+')');

      drawGrid(moveGrid);

      moveGrid.selectAll('rect.position')
        .data(card.getMoves(null))
        .enter()
        .append('rect')
        .classed('position', true)
        .attr('x', function(d) { return (2-d[0])*20 })
        .attr('y', function(d) { return (2-d[1])*20 })
        .attr('width', 20)
        .attr('height', 20)
        .attr('fill', 'grey');

      moveGrid.append('rect')
        .attr('x', 40)
        .attr('y', 40)
        .attr('width', 20)
        .attr('height', 20)
        .attr('fill', 'black');


      g.selectAll('text.card-caption')
        .data([card])
        .enter()
        .append('text')
        .classed('card-caption', true)
        .text(function(d) { return d.name; })
        .attr('text-anchor', 'middle')
        .attr('x', 175)
        .attr('y', 65);
    }

    function Perspective(gameState, color, svg) {
      this.gameState = gameState;
      this.color = color;
      this.svg = d3.select(svg);

      this._b = (this.color === 'WHITE') ? 0 : 4;
      this._m = (this.color === 'WHITE') ? 1 : -1;

      this.svg.attr('viewBox', '-1 -1 102 152')

      this.svgBoard = this.svg.append('g')
        .attr('transform', 'translate(0, 25)');

      this.renderGridLines(this.svgBoard);
      this.renderPieces(this.svgBoard);

      var fff = this.svg.append('g');
      drawCard(fff, this.gameState.whiteHand[0], false);
    }

    Perspective.prototype = {
      _gridXToSvgX: function(gridX) {
        return (gridX-this._b) * this._m * 20 + 10;
      },
      _gridYToSvgY: function(gridY) {
        return (gridY-this._b) * this._m * 20 + 10;
      },
      renderGridLines: function(board) {
        var gridLines = board
          .append('g')
          .classed('grid-lines', true);

        drawGrid(gridLines);
      },
      renderPieces: function(board) {
        var self = this;

        var piecesContainer = board
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

      },
      renderCard: function(g) {

      }
    };

    return Perspective;
  }

  define([
    'd3',
    'game'
  ], wrap);
})();
