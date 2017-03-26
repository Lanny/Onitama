;(function() {
  function wrap() {
    class ApplicationError extends Error {
      constructor(message='Unspecified application error',
                  type='PROTO') {
        super(message);
        Object.defineProperty(this, "name", { value: this.constructor.name });
        Error.captureStackTrace(this, this.constructor);

        this.event = { message, type };
      }
    }

    return ApplicationError;
  };

  define([], wrap);
})();
