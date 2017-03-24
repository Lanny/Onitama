;(function() {
  function wrap(d3, game, utils) {
    var cardSlots = {
      'BLACK0': [5, 0],
      'BLACK1': [55, 0],
      'WHITE0': [5, 130],
      'WHITE1': [55, 130],
      'TRANSFER': [105, 65]
    };

    function getCardCoords(position, perspective) {
      if (position === 'TRANSFER') {
        return cardSlots[position];
      }

      var b = (perspective === 'WHITE') ? 0 : 130,
        m = (perspective === 'WHITE') ? 1 : -1;

      return [
        (cardSlots[position][0] - b) * m,
        cardSlots[position][1]
      ];
    }

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

    function drawCard(g, card) {
      var border = 12.5;

      g.classed('card', true)
        .attr('transform', 'scale(0.16)')
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
        .attr('x', d => (2-d[0])*20 )
        .attr('y', d => (2-d[1])*20 )
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

      this._activeCell = null;

      this._b = (this.color === 'WHITE') ? 4 : 0;
      this._m = (this.color === 'WHITE') ? -1 : 1;
      this._rb = (this.color === 'BLACK') ? 4 : 0;
      this._rm = (this.color === 'BLACK') ? -1 : 1;

      this.svg.attr('viewBox', '-1 -1 152 152');

      this.svgBoard = this.svg.append('g')
        .attr('transform', 'translate(0, 25)')
        .on('click', this.onBoardClick.bind(this));

      this.renderGridLines(this.svgBoard);
      this.renderPieces(this.svgBoard);
      this.renderCards(this.svg);
    }

    Perspective.prototype = {
      _gridXToSvgX(gridX) {
        return (gridX-this._b) * this._m * 20 + 10;
      },
      _gridYToSvgY(gridY) {
        return (gridY-this._b) * this._m * 20 + 10;
      },
      _svgXYToGridXY([sx,sy]) {
        return [
          (~~(sx / 20)) / this._m + this._b,
          (~~(sy / 20)) / this._m + this._b,
        ];
      },
      _gatherMovesForCard(card) {
        var {x: acx, y: acy} = this._activeCell,
          validMoves = card.getMoves()
            .map(([x,y]) => [(x-this._rb) * this._rm, (y-this._rb) * this._rm])
            .map(([x,y]) => [x+acx, y+acy])
            .filter(([x,y]) => x > -1 && x < 5 && y > -1 && y < 5)
            .filter(([x,y]) => {
              var contents = this.gameState.getCellContents(x,y);
              return contents === null || contents.getColor() !== this.color;
            })

        return validMoves;
      },
      gatherMoves() {
        if (!this._activeCell) {
          return [];
        }

        var cards = this.gameState.getAvailableCards(this.color),
          moveLists = cards.map(card => this._gatherMovesForCard(card)),
          moves = {},
          combinedMoveList = [];

        for (var i=0; i<cards.length; i++) {
          for (var k=0; k<moveLists[i].length; k++) {
            var key = `${moveLists[i][k][0]},${moveLists[i][k][1]}`;

            if (key in moves) {
              moves[key].cards.push(cards[i]);
            } else {
              moves[key] = {
                cards: [cards[i]],
                cell: moveLists[i][k]
              }
            }
          }
        }

        for (var key in moves) {
          combinedMoveList.push(moves[key]);
        }

        return combinedMoveList;
      },
      onBoardClick() {
        var [x, y] = this._svgXYToGridXY(d3.mouse(this.svgBoard.node()));

        var contents = this.gameState.getCellContents(x, y);

        if (contents !== null &&
            contents.getColor() === this.gameState.currentTurn &&
            contents.getColor() === this.color) {

          if (this._activeCell &&
              this._activeCell.x === x &&
              this._activeCell.y === y) {
            this._activeCell = null;
          } else {
            this._activeCell = {x, y};
          }
        }

        this.updateCellHighlights();
      },
      updateCellHighlights() {
        var data = this._activeCell ? [this._activeCell] : [];

        rectify( this.svgBoard, 'rect.highlighted-cell', data,
          selection => selection
            .classed('highlighted-cell', true)
            .attr('x', d => this._gridXToSvgX(d.x) - 10 )
            .attr('y', d => this._gridYToSvgY(d.y) - 10 )
            .attr('width', 20)
            .attr('height', 20)
            .attr('fill', 'none')
            .attr('stroke', 'yellow')
            .attr('stroke-width', 1));
      },
      renderGridLines(board) {
        var gridLines = board
          .append('g')
          .classed('grid-lines', true);

        drawGrid(gridLines, 'white');
      },
      renderPieces(board) {
        var piecesContainer = board
          .append('g')
          .classed('pieces', true);

        piecesContainer.selectAll('image.piece')
          .data(this.gameState.getPieces())
          .enter()
          .append('image')
          .classed('piece', true)
          .attr('width', 15)
          .attr('height', 15)
          .attr('href', d => d.piece.getSvgPath() );

        piecesContainer.selectAll('image.piece')
          .exit()
          .remove();

        piecesContainer.selectAll('image.piece')
          .attr('x', d => this._gridXToSvgX(d.x) - 7.2 )
          .attr('y', d => this._gridYToSvgY(d.y) - 7.5 );
      },
      renderCards(svg) {
        var self = this;
        var cards = svg.selectAll('g.card')
          .data(this.gameState.deck);

        cards.enter()
          .append('g')
          .each((card, i, nodes) => drawCard(d3.select(nodes[i]), card));

        cards = svg.selectAll('g.card');

        cards.attr('transform', d => (new utils.Matrix())
                   .scale(0.16)
                   .translate(...getCardCoords(d.hand, self.color))
                   .fmt());
      }
    };

    return Perspective;
  }

  define([
    'd3',
    'game',
    'utils'
  ], wrap);
})();
