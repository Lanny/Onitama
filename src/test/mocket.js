;(function() {
  function wrap() {
    // A mock... socket! Socket.io socket that is.
    function Mocket() {
      this._eventListeners = {};
    }

    Mocket.prototype = {
      on: function(eventName, callback) {
        if (!(eventName in this._eventListeners)) {
          this._eventListeners[eventName] = [];
        }

        this._eventListeners[eventName].push(callback);
      },
      emit: function(eventName, data) {
        (this._eventListeners[eventName] || [])
          .forEach(cb => cb(data));
      }
    }

    return Mocket;
  }

  define([], wrap);
})();
