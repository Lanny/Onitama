;(function() {
  function wrap(game, utils, {BLACK, WHITE}) {
    const defaultWeights = {
      PAWN: 10,
      VICTORY: 1000,
      SKEW: 0,
    };

    function branchAndMove(move, gameState) {
      var branch = gameState.branch();
      move.card = branch.localizeCard(move.card);
      branch.executeMove(move.sourceCell, move.targetCell, move.card);
      return branch;
    }

    function baseEvalState(perspective, gameState, weights=defaultWeights) {
      var value = 0;

      if (gameState.winner === perspective) {
        value += weights.VICTORY;
      } else if (gameState.winner !== null) {
        value -= weights.VICTORY;
      }

      gameState.getPieces()
        .forEach(({piece}) => {
          if (piece.color === perspective) {
            value += weights.PAWN;
          } else {
            value -= weights.PAWN;
          }
        });

      return value;
    }

    function evalMove(move, gameState, depth, weights=defaultWeights) {
      const branch = branchAndMove(move, gameState),
        perspective = gameState.currentTurn;

      if (depth <= 0) {
        move.value = baseEvalState(perspective, branch, weights);
      } else {
        const opponentMove = recursiveBestMove(branch, depth-1, weights);

        if (opponentMove === null) {
          move.value = baseEvalState(perspective, branch, weights);
          return move;
        }

        const branch2 = branchAndMove(opponentMove, branch),
          followupMove = recursiveBestMove(branch2, depth-2, weights);

        if (followupMove === null) {
          move.value = baseEvalState(perspective, branch, weights);
          return move;
        }

        move.value = followupMove.value;
      }

      return move;
    }

    function recursiveBestMove(gameState, depth, weights=defaultWeights) {
      if (gameState.winner) {
        return null;
      }

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
            })
            .reduce(utils.flattenReduce, []);
        })
        .reduce(utils.flattenReduce, [])
        .map(move => evalMove(move, gameState, depth-1, weights))
        .sort((l, r) => r.value - l.value);

      return possibleMoves[0];
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
