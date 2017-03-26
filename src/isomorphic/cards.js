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
      }
    };

    var cards = [
      new SimpleCard('Tiger', [[0, 2], [0, -1]]),
      new SimpleCard('Monkey', [[1, 1], [-1, -1], [-1, 1], [1, -1]]),
      new SimpleCard('Horse', [[1,0], [0, 1], [0, -1]]),
      new SimpleCard('Crane', [[0,1], [-1, 1], [-1, -1]]),
      new SimpleCard('Elephant', [[1,0], [1,1], [-1,0], [-1,1]])
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
