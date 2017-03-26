function wrap() {
  function Participant(socket, color) {
    this.socket = socket;
    this.color = color;
  }

  Participant.prototype = {
    assignRole() {
      this.emit('->assignRole', { color: this.color });
    },
    emit(...args) {
      this.socket.emit(...args);
    }
  }

  return Participant;
}

define([], wrap);
