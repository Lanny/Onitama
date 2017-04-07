;(function() {
  function wrap(d3, {rectify}) {
    function sentenceCase(s) {
      return s[0].toUpperCase() + s.substr(1);
    }
    
    function Logger(element, perspective) {
      this.log = [];
      this.logElement = d3.select(element);
      this.perspective = perspective;
    }

    Logger.prototype = {
      logMove(message, move) {
        this.logMessage('MOVE', sentenceCase(message), move);
      },
      logChat(msg) {
        this.logMessage('INFO', `${ msg.senderName }: ${msg.message}`);
      },
      info(message) {
        this.logMessage('INFO', sentenceCase(message));
      },
      error(message) {
        this.logMessage('ERROR', 'ERROR: ' + sentenceCase(message));
      },
      logMessage(type, message, extra=null) {
        this.log.push({ type, message, extra });
        this.rectifyLog();
      },
      setPerspective(perspective) {
        this.perspective = perspective;
      },
      rectifyLog() {
        rectify(this.logElement, 'li.log-message', this.log,
          selection => selection
            .classed('log-message', true)
            .text(d => d.message)
            .on('mouseover', d => {
              if (d.type === 'MOVE') {
                this.perspective.showMove(d.extra);
              }
            })
            .on('mouseout', d => {
              if (d.type === 'MOVE') {
                this.perspective.clearShownMoves();
              }
            }));

        this.logElement.node().scrollTop = 99999;
      }
    };

    return Logger;
  }

  define([
    'd3',
    'client-utils'
  ], wrap)
})();
