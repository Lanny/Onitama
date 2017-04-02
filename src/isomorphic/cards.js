;(function() {
  function wrap() {
    function SimpleCard(name, moves, hand) {
      this.name = name;
      this._moves = moves;
      this.hand = hand || null;
    }

    SimpleCard.prototype = {
      getMoves: function() {
        return this._moves;
      },
      serialize: function() {
        return {
          name: this.name,
          moves: this._moves,
          hand: this.hand,
          type: 'SIMPLE'
        };
      },
      getColor() {
        if (this.hand === 'TRANSFER') {
          return null;
        }

        return this.hand.substring(0,5);
      }
    };

    var cards = [
      new SimpleCard('Tiger', [[0, 2], [0, -1]]),
      new SimpleCard('Crab', [[2, 0], [-2, 0], [0, 1]]),
      new SimpleCard('Monkey', [[1, 1], [-1, -1], [-1, 1], [1, -1]]),
      new SimpleCard('Crane', [[0,1], [-1,-1], [1, -1]]),
      new SimpleCard('Dragon', [[2,1],[-2,1],[-1,-1],[1,-1]]),
      new SimpleCard('Elephant', [[1,0], [1,1], [-1,0], [-1,1]]),
      new SimpleCard('Mantis', [[1,1], [-1,1], [0,-1]]),
      new SimpleCard('Boar', [[-1,0], [1,0], [0,1]]),
      new SimpleCard('Frog', [[-2,0], [-1,1], [1,-1]]),
      new SimpleCard('Goose', [[-1,1],[-1,0],[1,0],[1,-1]]),
      new SimpleCard('Horse', [[-1,0], [0, 1], [0, -1]]),
      new SimpleCard('Eel', [[-1,1], [-1,-1], [0,1]]),
      new SimpleCard('Rabbit', [[-1,-1], [1,1], [2,0]]),
      new SimpleCard('Rooster', [[-1,-1], [-1,0], [1,0], [1,1]]),
      new SimpleCard('Ox', [[0,1], [0,-1], [1,0]]),
      new SimpleCard('Cobra', [[-1,0], [1,1], [1,-1]])
    ];

    function loadCard(description) {
      if (description.type === 'SIMPLE') {
        return new SimpleCard(
          description.name,
          description.moves,
          description.hand);
      } else {
        throw Error(`Can not load card type: ${ description.type }`);
      }
    }

    return {
      deck: cards,
      loadCard: loadCard
    };
  }

  define([], wrap);
})();
