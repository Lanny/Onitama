;(function() {
  function wrap() {
    var WHITE = 0,
      BLACK = 1;

    function drawCard(deck) {
      var idx = ~~(Math.random() * deck.length);
      return deck.splice(idx, 1)[0];
    }

    function shuffle(arr) {
      // clone and FY shuffle an array
      arr = arr.slice()

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
      getColor: {
        return this._color;
      },
      getType: {
        if (this instanceof Student) {
          return 'STUDENT';
        } else if (this instanceof Master) {
          return 'MASTER';
        } else {
          throw new Error('Wat?');
        }
      }
    }

    function Student(color) {
      Piece.call(this, color);
    }
    Student.prototype = new Piece();

    function Master(color) {
      Piece.call(this, color);
    }
    Master.prototype = new Piece();

    function GameState() {
      this.board = null;
      this.transferSlot = null;
      this.whiteHand = [];
      this.blackHand = [];

      this.init();
    }

    GameState.prototype = {
      init: function() {
        this.board = [
          [
            new Student(BLACK),
            new Student(BLACK),
            new Master(BLACK),
            new Student(BLACK),
            new Student(BLACK),
          ],
          new Array(5),
          new Array(5),
          new Array(5),
          [
            new Student(WHITE),
            new Student(WHITE),
            new Master(WHITE),
            new Student(WHITE),
            new Student(WHITE),
          ]
        ];

        var deck = shuffle(cards.deck).splice(0, 5);
        this.whiteHand.push(drawCard(deck));
        this.whiteHand.push(drawCard(deck));
        this.blackHand.push(drawCard(deck));
        this.blackHand.push(drawCard(deck));
        this.transferSlot = drawCard(deck);
      }
    };

    var Module = {
      GameState: GameState,
      Student: Student,
      Master: Master
    }
  }

  define([
    'cards'
  ], wrap);
})();
