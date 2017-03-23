;(function() {
  function wrap(cards) {
    var WHITE = 'WHITE',
      BLACK = 'BLACK';

    function drawCard(deck) {
      var idx = ~~(Math.random() * deck.length);
      return deck.splice(idx, 1)[0];
    }

    function shuffle(arr) {
      // clone and FY shuffle an array
      arr = arr.slice();

      var j, tmp;
      for (var i=arr.length - 1; i>0; i--) {
        j = ~~(Math.random() * (i + 1));
        tmp = arr[i];
        arr[i] = Object.create(arr[j]);
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
      executeMove(initialPosition, targetPosition, card) {
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
    'cards'
  ], wrap);
})();
