var requirejs = require('requirejs');

function wrap(uuid, Participant, {WHITE, BLACK, PARTICIPANT}) {
  function GameSession() {
    this.white = null;
    this.black = null;
    this.observers = [];
    this.id = uuid();
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
        participant = new Participant(socket, WHITE);
        this.white = participant;
        color = WHITE;
      } else if (this.black === null) {
        participant = new Participant(socket, BLACK);
        this.black = participant;
        color = BLACK;
      } else {
        participant = new Participant(socket, PARTICIPANT);
        color = PARTICIPANT;
      }

      participant.assignRole();

      this.observers.push(participant);
      this.broadcast(participant, 'roleAssigned', { color });
    }
  };

  return GameSession;
}

requirejs.define([
  'uuid/v4',
  'participant',
  '../isomorphic/colors'
], wrap);
