;(function() {
  function wrap() {
    function Matrix(data) {
      if (data === undefined) {
        this._data = [1, 0, 0, 1, 0, 0];
      } else {
        this._data = data;
      }
    }

    Matrix.prototype = {
      translate: function(x, y) {
        var newData = this._data.slice();
        newData[4] += x;
        newData[5] += y;

        return new Matrix(newData);
      },
      scale: function(x,y) {
        var newData = this._data.slice();
        y = (y === undefined) ? x : y;

        newData[0] *= x;
        newData[3] *= y;

        return new Matrix(newData);
      },
      fmt: function() {
        return `matrix(${this._data.join(',')})`;
      }
    };

    return { Matrix };
  }

  define([], wrap);
})();
