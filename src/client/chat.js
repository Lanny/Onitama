;(function() {
  function wrap(d3) {
    function Chat(input, socket, logger) {
      this.socket = socket;
      this.logger = logger;
      this.input = d3.select(input);

      this.init();
    }

    Chat.prototype = {
      init: function() {
        this.input.on('keydown', () => {
          if (d3.event.keyCode === 13) {
            var node = this.input.node();

            this.socket.emit('->submitChatMessage', {
              message: node.value
            });

            node.value = '';
          }
        });

        this.socket.on('chatMessage', msg => this.logger.logChat(msg));
      }
    };

    return Chat;
  }

  define([
    'd3'
  ], wrap)
})();

