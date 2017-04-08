;(function() {
  function wrap() {
    function StorageManager() {
      this.localStorage = window.localStorage || {};
      this.sessionStorage = window.sessionStorage || {};
    }

    StorageManager.prototype = {
      get(key) {
        var store = this.sessionStorage[key];

        if (!store) {
          store = this.localStorage[key];
        }

        if (!store) {
          return null;
        }

        store = JSON.parse(store);
        if (store.expDate < Date.now()) {
          delete this.sessionStorage[key];
          delete this.localStorage[key];

          return null;
        }

        return store.value;
      },
      set(key, value, ttl=1000*60*60*24) {
        var store = JSON.stringify({
          value: value,
          expDate: Date.now() + ttl
        });

        this.localStorage[key] = store;
        this.sessionStorage[key] = store;
      }
    }

    return (new StorageManager());
  }

  define([], wrap);
})();

