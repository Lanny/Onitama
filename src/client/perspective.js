;(function() {
  function wrap(d3, game, AudioManager, utils, {WHITE, BLACK}, {rectify}) {
    function centerN(n, size, over) {
      const remainder = over - n * size,
        gap = remainder / (n+1);

      return d3.range(n)
        .map(x => x * (size +  gap) + gap + size / 2);
    }

    const [CARD_X1, CARD_X2] = centerN(2, 250*0.16, 100),
      cardSlots = {
        'BLACK0': [CARD_X1, 10],
        'BLACK1': [CARD_X2, 10],
        'WHITE0': [CARD_X1, 140],
        'WHITE1': [CARD_X2, 140],
        'TRANSFER': [125, 75]
      },
      pageTitle = document.title;

    function getCardCoords(position, perspective) {
      if (position === 'TRANSFER') {
        return cardSlots[position];
      }

      var b = (perspective === WHITE) ? 0 : 150,
        m = (perspective === WHITE) ? 1 : -1;

      return [
        cardSlots[position][0],
        (cardSlots[position][1] - b) * m
      ];
    }

    function arrowPath(length, thickness) {
      const path = d3.path(),
        ht = thickness / 2,
        flangeX = length - Math.cos(Math.PI/4) * thickness * 2;

      path.moveTo(0, ht);
      path.lineTo(0, -ht);
      path.lineTo(0, -ht);
      path.lineTo(flangeX, -ht);
      path.lineTo(flangeX, -thickness);
      path.lineTo(length, 0);
      path.lineTo(flangeX, thickness);
      path.lineTo(flangeX, ht);
      path.lineTo(0, ht);

      return path.toString();
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
      const border = 12.5;

      g.classed('card', true);

      rectify(g, 'rect.background', [card],
        selection => selection
          .classed('background', true)
          .attr('width', 250)
          .attr('height', 125)
          .attr('fill', 'white')
          .attr('stroke', 'black')
          .attr('stroke-width', 1));

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

    function Perspective(gameState, color, svg, socket, logger) {
      gs = socket;
      this.gameState = gameState;
      this.color = color;
      this.svg = d3.select(svg);
      this.socket = socket;
      this.logger = logger;
      this.audioManager = new AudioManager();

      this.cardPromptActive = false;
      this.moveIndicators = [];
      this._activeCell = null;

      this._b = (this.color === WHITE) ? 4 : 0;
      this._m = (this.color === WHITE) ? -1 : 1;

      this.svg.attr('viewBox', '-1 -1 152 152');

      this.svgBoard = this.svg.append('g')
        .attr('transform', 'translate(0, 25)')
        .on('click', this.onBoardClick.bind(this));


      this.renderGridLines(this.svgBoard);

      this.pieceGroup = this.svgBoard.append('g')
        .classed('pieces', true);

      this.moveIndicatorGroup = this.svgBoard.append('g')
        .classed('move-indicators', true);

      this.cardsGroup = this.svg.append('g')
        .classed('cards-group', true);

      this.cardPromptGroup = this.svg.append('g')
        .classed('card-prompt', true);

      this.statusLine = this.svg.append('text')
        .classed('status-line', true)
        .attr('x', 145)
        .attr('y', 2)
        .attr('font-size', 3)
        .attr('text-anchor', 'end');

      this.renderPieces();
      this.renderCards();
      this.renderStatusLine();

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
      rectifyMoveIndicators() {
        rectify(this.moveIndicatorGroup, 'path.move-indicator', this.moveIndicators,
          selection => selection
            .classed('move-indicator', true)
            .attr('d', d => {
              const a = d.initialPosition[0] - d.targetPosition[0],
                b = d.initialPosition[1] - d.targetPosition[1],
                length = Math.sqrt(a * a + b * b);

              return arrowPath(length, 0.1);
            })
            .attr('transform', d => {
              const isx = this._gridXToSvgX(d.initialPosition[0]),
                isy = this._gridYToSvgY(d.initialPosition[1]),
                tsx = this._gridXToSvgX(d.targetPosition[0]),
                tsy = this._gridYToSvgY(d.targetPosition[1]);

              return (new utils.Matrix())
                .translate(isx, isy)
                .rotate(Math.atan2(tsy-isy, tsx-isx))
                .scale(20)
                .fmt();
              })
              .attr('stroke', d => (d.color===WHITE)?'black':'white')
              .attr('stroke-width', 0.01)
              .attr('fill', d => (d.color===WHITE)?'white':'black'));
      },
      showMove(move) {
        this.moveIndicators = [move];
        this.rectifyMoveIndicators();
      },
      clearShownMoves() {
        this.moveIndicators = [];
        this.rectifyMoveIndicators();
      },
      executePerspectiveMove(initialPosition, targetPosition, card) {
        const move = {
          initialPosition: initialPosition,
          targetPosition: targetPosition,
          card: card.serialize(),
          color: this.color
        };

        this.socket.emit('->makeMove', move);
        this.logger.logMove(`You moved from ${ utils.niceCoords(initialPosition) } to ${ utils.niceCoords(targetPosition) } by playing the ${ card.name } card.`, move);
        this.gameState.executeMove(initialPosition, targetPosition, card);
      },
      promptForCard() {
        if (this.cardPromptActive) {
          throw new Error('Card prompt already in progress.');
        }

        return new Promise((resolve, reject) => {
          this.cardPromptActive = true;
          this.cardPromptGroup.attr('display', 'block');
          const options = this.gameState.getAvailableCards(this.color);
          const cleanup = () => {
            this.cardPromptActive = false;
            this.cardPromptGroup.attr('display', 'none');
          }

          rectify(this.cardPromptGroup, 'rect.overlay', [null],
            selection => selection
              .classed('overlay', true)
              .attr('fill', 'rgba(0,0,0,0.7)')
              .attr('x', -1)
              .attr('y', -1)
              .attr('width', 152)
              .attr('height', 152)
              .on('click', () => {
                cleanup();
                reject();
              }));

          rectify(this.cardPromptGroup, 'g.card', options,
            selection => selection
              .each((card, i, nodes) => rectifyCard(d3.select(nodes[i]), card))
              .attr('transform', (d, i) => (new utils.Matrix())
                .translate(16 + (i*67), 62.5)
                .scale(0.2)
                .fmt())
              .on('click', d => {
                cleanup();
                resolve(d);
              }));
        });
      },
      promptForRematch() {
        return new Promise((resolve, reject) => {
          var promptGroup = this.svg.append('g')
            .classed('rematch-prompt', true)
            .attr('transform', 'translate(112.5, 90)');

          const rematchButton = promptGroup
            .append('g')
            .attr('transform', 'translate(0,3)')
            .style('cursor', 'pointer')
            .on('mouseover', () => buttonFrame.attr('fill', 'lightgrey'))
            .on('mouseout', () => buttonFrame.attr('fill', 'none'))
            .on('click', () => {
              promptGroup.remove();
              resolve();
            });

          const buttonFrame = rematchButton
            .append('rect')
            .attr('width', 25)
            .attr('height', 7)
            .attr('fill', 'none')
            .attr('stroke', 'black')
            .attr('stroke-width', .5)

          rematchButton
            .append('text')
            .text('REMATCH')
            .attr('x', '12.5')
            .attr('y', '5')
            .attr('text-anchor', 'middle')
            .attr('fill', 'black')
            .style('font-size', '4px');

        });
      },
      attemptSettingActiveCell(x, y) {
        if (this.gameState.started === false ||
            this.gameState.terminated) {
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
              this.promptForCard().then(
                card => this.executePerspectiveMove([acx, acy], [x, y], card),
                () => console.info('Player cancled card select'));
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
        this.gameState.onStateChange(info => {
          if (info.type === 'TURN') {
            this.audioManager.playMoveSound();
          } else if (info.type === 'VICTORY' &&
                     (this.color === WHITE || this.color === BLACK)) {
            this.promptForRematch()
              .then(
                () => this.socket.emit('->proposeRematch', {}),
                () => null);
          }

          this.renderPieces();
          this.renderCards();
          this.renderStatusLine();

          if (this.gameState.currentTurn === this.color &&
              this.gameState.started === true &&
              this.gameState.terminated !== false) {
            document.title = '* ' + pageTitle;
          } else {
            document.title = pageTitle;
          }
        });
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
      renderPieces() {
        const piecesContainer = this.svgBoard.selectAll('g.pieces'),
          data = this.gameState.getPieces();

        rectify(piecesContainer, 'image.piece', data,
          selection => selection
            .classed('piece', true)
            .attr('width', 15)
            .attr('height', 15)
            .attr('xlink:href', d => d.piece.getSvgPath() )
            .attr('x', d => this._gridXToSvgX(d.x) - 7.2 )
            .attr('y', d => this._gridYToSvgY(d.y) - 7.5 ));
      },
      renderCards() {
        rectify(this.cardsGroup, 'g.card', this.gameState.deck,
          selection => selection
          .each((card, i, nodes) => 
            rectifyCard(d3.select(nodes[i]), card))
          .attr('transform', card => {
            const topSide = (this.color===WHITE)?BLACK:WHITE;
              flipped = (card.hand === 'TRANSFER') ?
                this.gameState.currentTurn === topSide :
                card.getColor()===topSide;

            return (new utils.Matrix())
              .translate(...getCardCoords(card.hand, this.color))
              .rotate(flipped ? Math.PI : 0)
              .scale(0.16)
              .translate(-250/2, -125/2)
              .fmt();
          }));
      },
      renderStatusLine() {
        var statusText;
        if (!this.gameState.started) {
          statusText = 'Waiting for players';
        } else if (!!this.gameState.winner) {
          statusText = `${utils.niceName(this.gameState.winner)} has won the game`;
        } else {
          const curPlayer = utils.niceName(this.gameState.currentTurn);
          if (this.gameState.currentTurn === this.color) {
            statusText = `${curPlayer} (you) to move`;
          } else {
            statusText = `${curPlayer} to move`;
          }
        }

        this.statusLine.text(statusText);
      }
    };

    return Perspective;
  }

  define([
    'd3',
    'game',
    'audio-manager',
    'utils',
    'colors',
    'client-utils'
  ], wrap);
})();
