var requirejs = require('requirejs');

function wrap(uuid) {
  function GameSession() {
    this.white = null;
    this.black = null;
    this.id = uuid();
  }

  GameSession.prototype = {
    isAwaitingPlayer() {
      return this.white === null || this.black === null;
    }
  };

  return GameSession;
}

requirejs.define([
  'uuid/v4'
], wrap);
