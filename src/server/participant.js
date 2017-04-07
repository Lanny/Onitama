function wrap() {
  function Participant(socket, session, color) {
    this.socket = socket;
    this.session = session;
    this.color = color;

    this.init();
  }

  Participant.prototype = {
    init() {
      this.socket.on('->submitChatMessage', msg => 
        this.session.submitChatMessage(this, msg.message));
    },
    assignRole() {
      this.emit('->assignRole', {
        color: this.color,
        gameState: this.session.gameState.serialize()
      });
    },
    emit(...args) {
      this.socket.emit(...args);
    },
    on(...args) {
      this.socket.on(...args);
    },
    isConnected() {
      return true;
    }
  }

  return Participant;
}

define([], wrap);
