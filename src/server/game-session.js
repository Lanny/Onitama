;(function() {
  function wrap(uuid, Participant, game, utils, AppError, cards,
                {WHITE, BLACK, PARTICIPANT}) {
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
      handleDisconnect(observer) {
        utils.removeFromArray(this.observers, observer);
        if (observer === this.black) this.black = null;
        if (observer === this.white) this.white = null;

        this.publish('participantDisconnected', {
          color: observer.color
        });
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

        participant.on('disconnect',
                       this.handleDisconnect.bind(this, participant));

        if (!this.gameState.started && this.black && this.white) {
          this.gameState.start();
          this.publish('gameStarted', {});
        }

        return participant;
      },
      submitMove(move, participant) {
        const piece = this.gameState.getCellContents(...move.initialPosition),
          card = this.gameState.localizeCard(move.card);

        if (!piece || piece.getColor() !== participant.color) {
          throw new AppError(
            `Piece at ${move.initialPosition} does not belong to ${participant.color}`,
            'INVALID_MOVE');
        }

        const validation = this.gameState.validateMove(
          move.initialPosition,
          move.targetPosition,
          card);

        if (!validation.valid) {
          throw new AppError(
            `Move did not validate. Reason: ${validation.reason}`,
            'INVALID_MOVE');
        } else {
          this.gameState.executeMove(
            move.initialPosition,
            move.targetPosition,
            card);

          participant.emit('moveAccepted', move);
          this.broadcast(participant, 'moveMade', move);
        }
      },
      getSpectators() {
        return Math.min(this.observers.length - 2, 0);
      },
      getState() {
        if (!this.gameState.started) {
          return 'awaiting players';
        } else {
          return 'in progresss';
        }
      }
    };

    return GameSession;
  }

  define([
    'uuid/v4',
    'participant',
    'game',
    'utils',
    'application-error',
    'cards',
    'colors'
  ], wrap);
})();
