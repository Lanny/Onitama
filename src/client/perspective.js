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
        cardSlots[position][0],
        (cardSlots[position][1] - b) * m
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

    function rectifyCard(g, card) {
      var border = 12.5;

      g.classed('card', true)
        .attr('transform', 'scale(0.16)')
        .append('rect')
        .attr('width', 250)
        .attr('height', 125)
        .attr('fill', 'none')
        .attr('stroke', 'black')
        .attr('stroke-width', 1);

      rectify(g, 'g.move-grid', [card],
        selection => selection
          .classed('move-grid', true)
          .attr('transform', `translate(${border},${border})`)
          .call(drawGrid));

      var moveGrid = g.select('g.move-grid');

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

      rectify(g, 'text.card-caption', [card],
        selection => selection
          .classed('card-caption', true)
          .text(function(d) { return d.name; })
          .attr('text-anchor', 'middle')
          .attr('x', 175)
          .attr('y', 65));
    }

    function Perspective(gameState, color, svg, socket) {
      this.gameState = gameState;
      this.color = color;
      this.svg = d3.select(svg);
      this.socket = socket;

      this._activeCell = null;

      this._b = (this.color === 'WHITE') ? 4 : 0;
      this._m = (this.color === 'WHITE') ? -1 : 1;

      this.svg.attr('viewBox', '-1 -1 152 152');

      this.svgBoard = this.svg.append('g')
        .attr('transform', 'translate(0, 25)')
        .on('click', this.onBoardClick.bind(this));

      this.renderGridLines(this.svgBoard);

      this.svgBoard
        .append('g')
        .classed('pieces', true);

      this.renderPieces(this.svgBoard);
      this.renderCards(this.svg);

      this.watchStateChange();
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
      executePerspectiveMove(initialPosition, targetPosition, card) {
        this.socket.emit('->makeMove', {
          initialPosition: initialPosition,
          targetPosition: targetPosition,
          card: card.serialize()
        });

        this.gameState.executeMove(initialPosition, targetPosition, card);
      },
      attemptSettingActiveCell(x, y) {
        if (this.gameState.started === false) {
          return false;
        }

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

          this.updateCellHighlights();
          return true;
        } else {
          return false;
        }
      },
      attemptMovingPiece(x, y) {
        // If we have an active cell and the user clicked on another cell,
        // attempt to make that move.
        if (this._activeCell && !utils.arrayEquals(this._activeCell, [x,y])) {
          const {x: acx, y: acy} = this._activeCell,
            move = this.gameState.gatherMoves([acx, acy])
              .filter(move => utils.arrayEquals(move.cell, [x,y]))[0];

          if (move !== undefined) {
            if (move.cards.length !== 1) {
              alert('DON\'T KNOW WHAT TO DO YET LOL!');
              return false;
            } else {
              this.executePerspectiveMove([acx, acy], [x, y], move.cards[0]);
            }

            this._activeCell = null;
            this.updateCellHighlights();

            return true;
          }

          return false;
        }
      },
      onBoardClick() {
        var [x, y] = this._svgXYToGridXY(d3.mouse(this.svgBoard.node()));

        if (this.attemptMovingPiece(x,y)) return;
        if (this.attemptSettingActiveCell(x,y)) return;
      },
      watchStateChange: (function() {
        var cont = true,
          stateChangeInfo;

        const next = (info) => {
          this.renderPieces(this.svgBoard);
          this.renderCards(this.svg);

          if (cont === true) {
            this.gameState.nextStateChange().then(next);
          } else {
            alert('Game has terminated');
          }
        };

        this.gameState.nextStateChange().then(next);
      }),
      updateCellHighlights() {
        var data = this._activeCell ? [this._activeCell] : [];

        rectify(this.svgBoard, 'rect.highlighted-cell', data,
          selection => selection
            .classed('highlighted-cell', true)
            .attr('x', d => this._gridXToSvgX(d.x) - 10 )
            .attr('y', d => this._gridYToSvgY(d.y) - 10 )
            .attr('width', 20)
            .attr('height', 20)
            .attr('fill', 'none')
            .attr('stroke', 'yellow')
            .attr('stroke-width', 1));

        var moves = this._activeCell ?
          this.gameState.gatherMoves([this._activeCell.x, this._activeCell.y]) :
          [];

        rectify(this.svgBoard, 'rect.possible-move', moves,
          selection => selection
            .classed('possible-move', true)
            .attr('x', d => this._gridXToSvgX(d.cell[0]) - 10 )
            .attr('y', d => this._gridYToSvgY(d.cell[1]) - 10 )
            .attr('width', 20)
            .attr('height', 20)
            .attr('fill', 'none')
            .attr('stroke', 'green')
            .attr('stroke-width', 1));

      },
      renderGridLines(board) {
        var gridLines = board
          .append('g')
          .classed('grid-lines', true);

        drawGrid(gridLines, 'white');
      },
      renderPieces(board) {
        const piecesContainer = board.selectAll('g.pieces'),
          data = this.gameState.getPieces();

        rectify(piecesContainer, 'image.piece', data,
          selection => selection
            .classed('piece', true)
            .attr('width', 15)
            .attr('height', 15)
            .attr('href', d => d.piece.getSvgPath() )
            .attr('x', d => this._gridXToSvgX(d.x) - 7.2 )
            .attr('y', d => this._gridYToSvgY(d.y) - 7.5 ));
      },
      renderCards(svg) {
        var self = this;

        rectify(svg, 'g.card', this.gameState.deck,
          selection => selection
          .each((card, i, nodes) => rectifyCard(d3.select(nodes[i]), card))
          .attr('transform', d => (new utils.Matrix())
            .scale(0.16)
            .translate(...getCardCoords(d.hand, self.color))
            .fmt()));
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
