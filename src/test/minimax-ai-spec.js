;(function() {
  function wrap(game, utils, minimaxAI) {
    describe('minimax-ai', function() {
      describe('recursiveBestMove', function() {
        var obviousGameData = {
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
              null,
              null,
              null,
              { "color": "WHITE", "type": "MASTER" },
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

        it('makes the super obvious move', function() {
          const gs = new game.GameState().loadState(obviousGameData),
            move = minimaxAI.recursiveBestMove(gs, 5);

          expect(utils.arrayEquals(move.sourceCell, [2,3])).toBe(true);
          expect(utils.arrayEquals(move.targetCell, [2,4])).toBe(true);
        });
      });
    });
  }

  define([
    'game',
    'utils',
    'minimax-ai'
  ], wrap);
})();
