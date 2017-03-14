;(function() {
  function wrap() {
    function const(value) {
      var f = function() {
        return value;
      };

      return f
    }

    var cards = [
      {
        name: 'Tiger',
        getMoves: const([[0, 2], [0, -1]])
      },
      {
        name: 'Monkey',
        getMoves: const([[1, 1], [1, -1], [-1, 1], [1, -1]])
      },
      {
        name: 'Horse',
        getMoves: const([[1,0], [0, 1], [0, -1]])
      },
      {
        name: 'Crane',
        getMoves: const([[0,1], [-1, 1], [-1, -1]])
      },
      {
        name: 'Elephant',
        getMoves: const([[1,0], [1,1], [-1,0], [-1,1]])
      }
    ];

    return {
      deck: cards
    };
  }

  define([], wrap);
})();
