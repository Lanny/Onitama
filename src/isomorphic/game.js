;(function() {
  function wrap(cards, utils) {
    var WHITE = 'WHITE',
      BLACK = 'BLACK';

    function drawCard(deck) {
      var idx = ~~(Math.random() * deck.length);
      return deck.splice(idx, 1)[0];
    }

    function shuffle(arr) {
      // clone and FY shuffle an array
      arr = arr.map(e => Object.create(e));

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
      }
    };

    function Student(color) {
      Piece.call(this, color);
    }
    Student.prototype = new Piece();
    Student.prototype.getSvgPath = function() {
      return 'svg/' + ((this._color === WHITE) ? 'white' : 'black') + '-pawn.svg';
    };

    function Master(color) {
      Piece.call(this, color);
    }
    Master.prototype = new Piece();
    Master.prototype.getSvgPath = function() {
      return 'svg/' + ((this._color === WHITE) ? 'white' : 'black') + '-king.svg';
    };

    function GameState() {
      this.board = null;
      this.deck = null;

      this.init();
    }

    GameState.prototype = {
      init() {
        this.board = [
          [ new Student(WHITE), null, null, null, new Student(BLACK) ],
          [ new Student(WHITE), null, null, null, new Student(BLACK) ],
          [ new Master(WHITE), null, null, null, new Master(BLACK) ],
          [ new Student(WHITE), null, null, null, new Student(BLACK) ],
          [ new Student(WHITE), null, null, null, new Student(BLACK) ],
        ];

        this.deck = shuffle(cards.deck).splice(0, 5);
        this.deck[0].hand = 'WHITE0';
        this.deck[1].hand = 'WHITE1';
        this.deck[2].hand = 'BLACK0';
        this.deck[3].hand = 'BLACK1';
        this.deck[4].hand = 'TRANSFER';

        this.currentTurn = WHITE;
      },
      validateMove(initialPosition, targetPosition, card) {
        const piece = this.getCellContents(...initialPosition);

        if (piece === null || piece.getColor() !== this.currentTurn) {
          return false;
        }

        const move = this.gatherMoves(initialPosition)
          .filter(move => utils.arrayEquals(move.cell, targetPosition))[0];

        if (move === undefined) {
          return false;
        }

        const cardWorks = !!(move.cards
          .filter(moveCard => moveCard === card)
          .length);

        return cardWorks;
      },
      executeMove(initialPosition, targetPosition, card) {
        if (!this.validateMove(initialPosition, targetPosition, card)) {
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
        var b = (color === BLACK) ? 4: 0,
          m = (color === BLACK) ? -1 : 1,
          validMoves = card.getMoves()
            .map(([x,y]) => [(x-b) * m, (y-b) * m])
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
    'utils'
  ], wrap);
})();
