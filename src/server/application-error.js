;(function() {
  function wrap() {
    function ApplicationError(message='Unspecified application error',
                              type='PROTO') {
      Error.call(this, message);
      this.event = { message, type };
    }

    ApplicationError.prototype = new Error();

    return ApplicationError;
  };

  define([], wrap);
})();
