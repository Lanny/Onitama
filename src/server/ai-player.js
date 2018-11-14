;(function() {
  function wrap(ai, {WHITE, BLACK}) {
    function Mocket() {
      this._pair = null;
      this._listeners = {};
    }

    Mocket.prototype = {
      setPair: function(pair) {
        this._pair = pair;
      },
      _check: function() {
        if (!(this._pair instanceof Mocket)) {
          throw Error('Can not operate on a unpaired Mocket');
        }
      },
      emit: function(eventName, msg) {
        this._check();
        const listeners = this._pair._listeners[eventName] || [];
        listeners.forEach(listener => listener(msg));
      },
      on: function(eventName, listener) {
        if (!(eventName in this._listeners)) {
          this._listeners[eventName] = [];
        }

        this._listeners[eventName].push(listener);
      }
    };

    function createMocketPair() {
      const firstMocket = new Mocket(),
        secondMocket = new Mocket();

      firstMocket.setPair(secondMocket);
      secondMocket.setPair(firstMocket);

      return [firstMocket, secondMocket];
    }

    function AIPlayer(gameSession) {
      this.gameSession = gameSession;
      this.init();
    }

    AIPlayer.prototype = {
      init: function() {
        const [myMocket, theirMocket] = createMocketPair();
        this.participant = this.gameSession.acceptParticipant(
          theirMocket, 'Botson', null);

        myMocket.on('moveMade', () => this._makeNextMoveMaybe());
        myMocket.on(
          'gameStarted',
          () => setTimeout(() => this._makeNextMoveMaybe(), 500));
      },
      _makeNextMoveMaybe: function() {
        const gs = this.gameSession.gameState;

        if (gs.currentTurn !== this.participant.color ||
            gs.winner ||
            gs.terminated) {
          return;
        }

        const move = ai.recursiveBestMove(this.gameSession.gameState, 3);
        this.gameSession.submitMove({
            initialPosition: move.sourceCell,
            targetPosition: move.targetCell,
            card: move.card
          }, this.participant);
      }
    };

    return AIPlayer;
  }

  define([
    'minimax-ai',
    'colors'
  ], wrap);
})();
