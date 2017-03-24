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

    function _arrayEquals(left, right) {
      if (!Array.isArray(left) ||
          !Array.isArray(right) ||
          left.length !== right.length) {
        return false;
      }

      for (let i=0; i<left.length; i++) {
        if (left[i] !== right[i]) return false;
      }

      return true;
    }

    function arrayEquals(...arrays) {
      var equalsNeighbor = [];
      for (let i=0; i<(arrays.length-1); i++) {
        equalsNeighbor.push(_arrayEquals(arrays[i], arrays[i+1]));
      }

      return equalsNeighbor.reduce((acc, b) => acc && b, true);
    }

    return { Matrix, arrayEquals };
  }

  define([], wrap);
})();
