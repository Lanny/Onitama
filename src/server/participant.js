function wrap() {
  function Participant(socket, session, color) {
    this.socket = socket;
    this.session = session;
    this.color = color;
  }

  Participant.prototype = {
    assignRole() {
      this.emit('->assignRole', {
        color: this.color,
        gameState: this.session.gameState.serialize()
      });
    },
    emit(...args) {
      this.socket.emit(...args);
    },
    isConnected() {
      return true;
    }
  }

  return Participant;
}

define([], wrap);
