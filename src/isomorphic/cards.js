;(function() {
  function wrap() {
    function constVal(value) {
      var f = function() {
        return value;
      };

      return f;
    }

    var cards = [
      {
        name: 'Tiger',
        getMoves: constVal([[0, 2], [0, -1]])
      },
      {
        name: 'Monkey',
        getMoves: constVal([[1, 1], [1, -1], [-1, 1], [1, -1]])
      },
      {
        name: 'Horse',
        getMoves: constVal([[1,0], [0, 1], [0, -1]])
      },
      {
        name: 'Crane',
        getMoves: constVal([[0,1], [-1, 1], [-1, -1]])
      },
      {
        name: 'Elephant',
        getMoves: constVal([[1,0], [1,1], [-1,0], [-1,1]])
      }
    ];

    return {
      deck: cards
    };
  }

  define([], wrap);
})();
