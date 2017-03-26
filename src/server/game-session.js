;(function() {
  function wrap(uuid, Participant, game, {WHITE, BLACK, PARTICIPANT}) {
    function GameSession() {
      this.white = null;
      this.black = null;
      this.observers = [];
      this.id = uuid();
      this.gameState = new game.GameState().initialize();
    }

    GameSession.prototype = {
      publish(eventName, event) {
        this.broadcast(null, eventName, event);
      },
      broadcast(except, eventName, event) {
        this.observers
          .filter(observer => observer !== except)
          .forEach(observer => observer.emit(eventName, event));
      },
      isAwaitingParticipant() {
        return this.white === null || this.black === null;
      },
      acceptParticipant(socket) {
        var color, participant;

        if (this.white === null) {
          participant = new Participant(socket, this, WHITE);
          this.white = participant;
          color = WHITE;
        } else if (this.black === null) {
          participant = new Participant(socket, this, BLACK);
          this.black = participant;
          color = BLACK;
        } else {
          participant = new Participant(socket, this, PARTICIPANT);
          color = PARTICIPANT;
        }

        participant.assignRole();

        this.observers.push(participant);
        this.broadcast(participant, 'roleAssigned', { color });

        if (!this.gameState.started &&
            this.black && this.black.isConnected() &&
            this.white && this.white.isConnected()) {
          this.gameState.start();
          this.publish('gameStarted', {});
        }
      }
    };

    return GameSession;
  }

  define([
    'uuid/v4',
    'participant',
    'game',
    'colors'
  ], wrap);
})();
