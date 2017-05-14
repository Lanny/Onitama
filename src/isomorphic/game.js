;(function() {
  function wrap(cards, utils, {BLACK, WHITE}) {

    function drawCard(deck) {
      var idx = ~~(Math.random() * deck.length);
      return deck.splice(idx, 1)[0];
    }

    function shuffle(arr) {
      // clone and FY shuffle an array
      arr = arr.map(utils.clone);

      var j, tmp;
      for (var i=arr.length - 1; i>0; i--) {
        j = ~~(Math.random() * (i + 1));
        tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
      }

      return arr;
    }

    function Piece(color) {
      this._color = color;
    }

    Piece.prototype = {
      getColor: function() {
        return this._color;
      },
      getType: function() {
        if (this instanceof Student) {
          return 'STUDENT';
        } else if (this instanceof Master) {
          return 'MASTER';
        } else {
          throw new Error('Wat?');
        }
      },
      getSvgPath: function() {
        throw Error('Not Implemented');
      },
      serialize: function() {
        return {
          color: this._color,
          type: this.getType()
        };
      }
    };

    function Student(color) {
      Piece.call(this, color);
    }
    Student.prototype = new Piece();
    Student.prototype.getSvgPath = function() {
      return '/static/svg/' + ((this._color === WHITE) ? 'white' : 'black') + '-pawn.svg';
    };

    function Master(color) {
      Piece.call(this, color);
    }
    Master.prototype = new Piece();
    Master.prototype.getSvgPath = function() {
      return '/static/svg/' + ((this._color === WHITE) ? 'white' : 'black') + '-king.svg';
    };

    function GameState() {
      this.board = null;
      this.deck = null;
      this.started = null;
      this.winner = null;
      this.terminated = null;

      this._stateChangeWatchers = [];
    }

    GameState.prototype = {
      initialize(deck) {
        this.board = [
          [ new Student(WHITE), null, null, null, new Student(BLACK) ],
          [ new Student(WHITE), null, null, null, new Student(BLACK) ],
          [ new Master(WHITE), null, null, null, new Master(BLACK) ],
          [ new Student(WHITE), null, null, null, new Student(BLACK) ],
          [ new Student(WHITE), null, null, null, new Student(BLACK) ],
        ];

        this.deck = shuffle(deck).splice(0, 5);
        this.deck[0].hand = 'WHITE0';
        this.deck[1].hand = 'WHITE1';
        this.deck[2].hand = 'BLACK0';
        this.deck[3].hand = 'BLACK1';
        this.deck[4].hand = 'TRANSFER';

        this.started = false;
        this.currentTurn = WHITE;

        return this;
      },
      _executeStateChange(info) {
        this._stateChangeWatchers.forEach(handler => handler(info));
      },
      localizeCard(cardData) {
        const card = this.deck.filter(lc => lc.name === cardData.name)[0];

        if (!card) {
          throw new Error(`Card with name ${card.name} not in deck`);
        }

        return card
      },
      validateMove(initialPosition, targetPosition, card) {
        const piece = this.getCellContents(...initialPosition);

        if (!this.started) {
          return {
            valid: false,
            reason: 'The game hasn\'t started yet.'
          };
        }

        if (this.winner !== null) {
          return {
            valid: false,
            reason: 'The game is over, no further moves allowed.'
          };
        }

        if (piece === null || piece.getColor() !== this.currentTurn) {
          return {
            valid: false,
            reason: 'Piece to move does not belong to the current player.'
          };
        }

        const move = this.gatherMoves(initialPosition)
          .filter(move => utils.arrayEquals(move.cell, targetPosition))[0];

        if (move === undefined) {
          return {
            valid: false,
            reason: 'There is no way for the current player to make this ' +
              'move with their current cards.'
          };
        }

        const cardWorks = !!(move.cards
          .filter(moveCard => moveCard === card)
          .length);

        if (!cardWorks) {
          return {
            valid: false,
            reason: 'The selected card can not move in that way.'
          };
        }

        return { valid: true };
      },
      executeMove(initialPosition, targetPosition, card) {
        if (!this.validateMove(initialPosition, targetPosition, card).valid) {
          throw new Error('Invalid move!');
        }


        const [ix, iy] = initialPosition,
          [tx, ty] = targetPosition;

        this.board[tx][ty] = this.board[ix][iy];
        this.board[ix][iy] = null;

        this.deck
          .filter(card => card.hand === 'TRANSFER')[0]
          .hand = card.hand;

        card.hand = 'TRANSFER';
        this.currentTurn = (this.currentTurn === WHITE) ? BLACK : WHITE;

        this._executeStateChange({
          type: 'TURN',
          player: this.currentTurn,
          initialPosition: initialPosition,
          targetPosition: targetPosition,
          card
        });

        // Check for victory
        const masters = this.getPieces()
          .filter(piece => piece.piece.getType() === 'MASTER');

        if (masters.length === 1) {
          // A master has been captured
          this.winner = masters[0].piece.getColor();
        }

        for (let i=0; i<masters.length; i++) {
          const {piece: master, x, y} = masters[i],
            [vx, vy] = (master.getColor() === 'WHITE') ? [2,4] : [2,0];

          if (x === vx && y === vy) {
            // A master has made it to the opposing side
            this.winner = master.getColor();
            break;
          }
        }

        if (this.winner !== null) {
          this.terminated = true;
          this._executeStateChange({
            type: 'VICTORY',
            winner: this.winner
          });
        }

      },
      getPieces() {
        var pieces = [];

        for (var x=0; x<5; x++) {
          for (var y=0; y<5; y++) {
            if (this.board[x][y] instanceof Piece) {
              pieces.push({
                piece: this.board[x][y],
                x: x,
                y: y
              });
            }
          }
        }

        return pieces;
      },
      getCellContents(x, y) {
        return this.board[x][y];
      },
      getAvailableCards(player) {
        return this.deck.filter(c => c.hand.substring(0,5) === player);
      },
      _gatherMovesForCard(color, card, [cx, cy]) {
        const m = (color === WHITE) ? 1 : -1,
          validMoves = card.getMoves()
            .map(([x,y]) => [x * m, y * m])
            .map(([x,y]) => [x+cx, y+cy])
            .filter(([x,y]) => x > -1 && x < 5 && y > -1 && y < 5)
            .filter(([x,y]) => {
              var contents = this.getCellContents(x,y);
              return contents === null || contents.getColor() !== color;
            });

        return validMoves;
      },
      gatherMoves(cell) {
        const piece = this.getCellContents(...cell);

        if (piece === null) {
          return [];
        }

        const color = piece.getColor(),
          cards = this.getAvailableCards(color),
          moveLists = cards
            .map(card => this._gatherMovesForCard(color, card, cell)),
          moves = {},
          combinedMoveList = [];

        for (let i=0; i<cards.length; i++) {
          for (let k=0; k<moveLists[i].length; k++) {
            let key = `${moveLists[i][k][0]},${moveLists[i][k][1]}`;

            if (key in moves) {
              moves[key].cards.push(cards[i]);
            } else {
              moves[key] = {
                cards: [cards[i]],
                cell: moveLists[i][k]
              };
            }
          }
        }

        for (let key in moves) {
          combinedMoveList.push(moves[key]);
        }

        return combinedMoveList;
      },
      isPassAvailable: function() {
        const numMoves = this.getPieces()
          .filter(({piece}) => piece.getColor() === this.currentTurn)
          .map(({x, y}) => this.gatherMoves([x, y]).length)
          .reduce((l, r) => l + r, 0);

        return numMoves < 1;
      },
      start: function() {
        this.started = true;
        this._executeStateChange({
          type: 'START'
        });
      },
      onStateChange(handler) {
        this._stateChangeWatchers.push(handler);
      },
      terminate() {
        this.terminated = true;
      },
      serialize() {
        const serializeCell = c => (c === null) ? null : c.serialize()
        return {
          board: this.board.map(row => row.map(serializeCell)),
          deck: this.deck.map(card => card.serialize()),
          currentTurn: this.currentTurn,
          started: this.started,
          winner: this.winner,
          terminated: this.terminated
        };
      },
      loadState(state) {
        this.board = state.board.map(row => row.map(piece => {
          if (piece === null) {
            return null;
          } else if (piece.type === 'MASTER') {
            return new Master(piece.color);
          } else if (piece.type === 'STUDENT') {
            return new Student(piece.color);
          } else {
            throw Error('Unexpected board entry:' + piece);
          }
        }));

        this.deck = state.deck.map(cards.loadCard);
        this.currentTurn = state.currentTurn;
        this.started = state.started;
        this.winner = state.winner;
        this.terminated = state.terminated;

        return this;
      }
    };

    var Module = {
      GameState: GameState,
      Student: Student,
      Master: Master
    };

    return Module;
  }

  define([
    'cards',
    'utils',
    'colors'
  ], wrap);
})();
