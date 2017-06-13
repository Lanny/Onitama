;(function() {
  function wrap(game, utils, {BLACK, WHITE}) {
    const defaultWeights = {
      PAWN: 10,
      VICTORY: 1000,
      SKEW: 0,
    };

    function baseEvalState(perspective, weights, gameState) {
      var value = 0;

      if (gameState.winner === perspective) {
        value += weights.VICTORY;
      } else if (gameState.winner !== null) {
        value -= weights.VICTORY;
      }

      gameState.getPieces()
        .forEaach(({piece}) => {
          if (piece.color === perspective) {
            value += defaultWeights.pawn;
          } else {
            value -= defaultWeights.pawn;
          }
        });

      return value;
    }

    function recursiveBestMove(weights, gameState, depth) {
      const possibleMoves = gameState.getPieces()
        .filter(cell => cell.piece.getColor() === gameState.currentTurn)
        .map(cell => {
          var targetCells = gameState.gatherMoves([cell.x, cell.y]);

          return targetCells.map(targetCell => {
            return targetCell.cards
              .map(card => {
                return {
                  card: card,
                  sourceCell: [cell.x, cell.y],
                  targetCell: targetCell.cell
                };
              })
              .reduce(utils.flattenReduce, []);
          });
        })
        .reduce(utils.flattenReduce, []);

      console.log(possibleMoves);

      if (depth <= 0) {
        return baseEvalState(gameState.currentTurn, weights, gameState);
      }

    }

    return {
      defaultWeights,
      baseEvalState,
      recursiveBestMove
    }
  }

  define([
    'game',
    'utils',
    'colors',
  ], wrap);
})();
