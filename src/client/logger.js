;(function() {
  function wrap(d3, {rectify}) {
    function sentenceCase(s) {
      return s[0].toUpperCase() + s.substr(1);
    }
    
    function Logger(element) {
      this.log = [];
      this.logElement = d3.select(element);
    }

    Logger.prototype = {
      info(message) {
        this.logMessage('INFO', sentenceCase(message));
      },
      error(message) {
        this.logMessage('ERROR', 'ERROR: ' + sentenceCase(message));
      },
      logMessage(type, message) {
        this.log.push({ type, message });
        this.rectifyLog();
      },
      rectifyLog() {
        rectify(this.logElement, 'li.log-message', this.log,
          selection => selection
            .classed('log-message', true)
            .text(d => d.message));

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
