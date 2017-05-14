;(function() {
  function wrap(game, cards) {
    describe('Game', function() {
      describe('passing', function() {
        var unpassableGameData = {
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

        var passableGameData = {
          "board": [
            [ null, null, null, null, null ],
            [ null, null, null, null, null ],
            [
              { "color": "BLACK", "type": "MASTER" },
              null,
              null,
              null,
              { "color": "WHITE", "type": "MASTER" }
            ],
            [ null, null, null, null, null ],
            [ null, null, null, null, null ]
          ],
          "deck": [
            {
              "name": "Fer-de-lance",
              "moves": [ [ 0, 2 ] ],
              "hand": "WHITE0",
              "group": "Extended",
              "type": "SIMPLE"
            },
            {
              "name": "Crane",
              "moves": [ [ 0, 1 ], [ -1, -1 ], [ 1, -1 ] ],
              "hand": "TRANSFER",
              "group": "Arcane Wonders",
              "type": "SIMPLE"
            },
            {
              "name": "Eel",
              "moves": [ [ -1, 1 ], [ -1, -1 ], [ 0, 1 ] ],
              "hand": "BLACK0",
              "group": "Arcane Wonders",
              "type": "SIMPLE"
            },
            {
              "name": "Boar",
              "moves": [ [ -1, 0 ], [ 1, 0 ], [ 0, 1 ] ],
              "hand": "BLACK1",
              "group": "Arcane Wonders",
              "type": "SIMPLE"
            },
            {
              "name": "Crocodile",
              "moves": [ [ 1, 1 ], [ 0, 1 ], [ -1, 1 ] ],
              "hand": "WHITE1",
              "group": "Extended",
              "type": "SIMPLE"
            }
          ],
          "currentTurn": "WHITE",
          "started": true,
          "winner": null,
          "terminated": null
        };

        it('isPassAvailable returns true for passable games', function() {
          const gs = new game.GameState().loadState(passableGameData);
          expect(gs.isPassAvailable()).toBe(true);
        });

        it('isPassAvailable returns false for unpassable games', function() {
          const gs = new game.GameState().loadState(unpassableGameData);
          expect(gs.isPassAvailable()).toBe(false);
        });
      });
    });
  }

  define([
    'game',
    'cards'
  ], wrap);
})();
