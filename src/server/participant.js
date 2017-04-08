;(function() {
  function wrap(uuid) {
    function Participant(socket, session, name, color) {
      this.socket = socket;
      this.session = session;
      this.color = color;
      this.id = uuid();
      this.rejoinCode = uuid();
      this.name = name;

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
          rejoinCode: this.rejoinCode,
          name: this.name,
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

  define([
   'uuid'
  ], wrap);
})();
