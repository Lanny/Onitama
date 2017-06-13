;(function() {
  function wrap(game, minimaxAI) {
    describe('minimax-ai', function() {
      describe('recursiveBestMove', function() {
        var testGameData = {
          "board": [
            [
              { "color": "WHITE", "type": "STUDENT" },
              null,
              null,
              null,
              { "color": "BLACK", "type": "STUDENT" }
            ],
            [
              {
                "color": "WHITE", "type": "STUDENT" },
              null,
              null,
              null,
              { "color": "BLACK", "type": "STUDENT" }
            ],
            [
              { "color": "WHITE", "type": "MASTER" },
              null,
              null,
              null,
              { "color": "BLACK", "type": "MASTER" }
            ],
            [
              { "color": "WHITE", "type": "STUDENT" },
              null,
              null,
              null,
              { "color": "BLACK", "type": "STUDENT" }
            ],
            [
              { "color": "WHITE", "type": "STUDENT" },
              null,
              null,
              null,
              { "color": "BLACK", "type": "STUDENT" }
            ]
          ],
          "deck": [
            {
              "name": "Eel",
              "moves": [ [ -1, 1 ], [ -1, -1 ], [ 0, 1 ] ],
              "hand": "WHITE0",
              "group": "Arcane Wonders",
              "type": "SIMPLE"
            },
            {
              "name": "Rooster",
              "moves": [ [ -1, -1 ], [ -1, 0 ], [ 1, 0 ], [ 1, 1 ] ],
              "hand": "WHITE1",
              "group": "Arcane Wonders",
              "type": "SIMPLE"
            },
            {
              "name": "Rabbit",
              "moves": [ [ -1, -1 ], [ 1, 1 ], [ 2, 0 ] ],
              "hand": "BLACK0",
              "group": "Arcane Wonders",
              "type": "SIMPLE"
            },
            {
              "name": "Crab",
              "moves": [ [ 2, 0 ], [ -2, 0 ], [ 0, 1 ] ],
              "hand": "BLACK1",
              "group": "Arcane Wonders",
              "type": "SIMPLE"
            },
            {
              "name": "Ox",
              "moves": [ [ 0, 1 ], [ 0, -1 ], [ 1, 0 ] ],
              "hand": "TRANSFER",
              "group": "Arcane Wonders",
              "type": "SIMPLE"
            }
          ],
          "currentTurn": "WHITE",
          "started": true,
          "winner": null,
          "terminated": null
        };

        it('blah', function() {
          const gs = new game.GameState().loadState(testGameData);
          minimaxAI.recursiveBestMove(minimaxAI.defaultWeights, gs, 1);
        });
      });
    });
  }

  define([
    'game',
    'minimax-ai'
  ], wrap);
})();
