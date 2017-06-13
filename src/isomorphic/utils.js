;(function() {
  function wrap({WHITE, BLACK, PARTICIPANT}) {
    function Matrix(data) {
      if (data === undefined) {
        this._data = [1, 0, 0, 1, 0, 0];
      } else {
        this._data = data;
      }
    }

    Matrix.prototype = {
      multiply(matrix) {
        const A = this._data,
          B = matrix._data;

        return new Matrix([
          A[0]*B[0] + A[2]*B[1],
          A[1]*B[0] + A[3]*B[1],
          A[0]*B[2] + A[2]*B[3],
          A[1]*B[2] + A[3]*B[3],
          A[4] + B[4],
          A[5] + B[5]
        ]);
      },
      translate(x, y, local=true) {
        var newData = this._data.slice();

        newData[4] = this._data[0] * x + this._data[2] * y + this._data[4];
        newData[5] = this._data[1] * x + this._data[3] * y + this._data[5];

        return new Matrix(newData);
      },
      scale(x,y) {
        var newData = this._data.slice();
        y = (y === undefined) ? x : y;

        newData[0] *= x;
        newData[1] *= x;
        newData[2] *= y;
        newData[3] *= y;

        return new Matrix(newData);
      },
      rotate(theta) {
        return this.multiply(new Matrix([
          Math.cos(theta),
          Math.sin(theta),
          0-Math.sin(theta),
          Math.cos(theta),
          0,
          0
        ]));
      },
      fmt() {
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

    function clone(obj) {
      var newObj = {};
      for (let key in obj) {
        newObj[key] = obj[key];
      }

      return newObj;
    }

    function removeFromArray(arr, target) {
      const idx = arr.indexOf(target);
      arr.splice(idx, 1);
      return arr;
    }

    function niceName(color, includeArticle=false) {
      if (includeArticle && color === PARTICIPANT) {
        return 'a spectator';
      }

      switch (color) {
        case WHITE: return 'white';
        case BLACK: return 'black';
        case PARTICIPANT: return 'spepctator';
        default: throw Error('Invalid color: ' + color);
      }
    }

    function bifurcate(str, sym) {
      var idx = str.indexOf(sym);

      if (idx === -1) {
        return [str];
      } else {
        return [str.substring(0, idx), str.substring(idx + sym.length)];
      }
    }

    function parseUrl(urlStr) {
      var parsed = {};
      var withoutProto, withoutHost, withoutPath, withoutQuery, query;

      if (urlStr.indexOf('://') !== -1) {
        [parsed.protocol, withoutProto] = bifurcate(urlStr, '://');
      } else {
        parsed.protocol = null;
        withoutProto = urlStr;
      }

      [parsed.host, withoutHost] = bifurcate(withoutProto, '/');

      if (!withoutHost)
        return parsed;

      var hasQuery, hasHash;
      if (withoutHost.indexOf('?') !== -1) {
        [parsed.path, withoutPath] = bifurcate(withoutHost, '?');

        hasQuery = true;
        hasHash = withoutPath.indexOf('#') !== -1 
      } else if (withoutHost.indexOf('#') !== -1) {
        [parsed.path, withoutPath] = bifurcate(withoutHost, '#');

        withoutQuery = withoutPath;
        hasQuery = false;
        hasHash = true;
      } else {
        parsed.path = withoutHost;
        return parsed;
      }

      if (hasQuery) {
        var query;

        [query, withoutQuery] = bifurcate(withoutPath, '#');

        var pairs = query.split('&'),
          queryMap = {};

        for (var i=0; i<pairs.length; i++) {
          var [key, val] = bifurcate(pairs[i], '=');

          if (!(key in queryMap)) {
            queryMap[key] = [];
          }

          queryMap[key].push(val);
        }

        parsed.query = queryMap;
      }

      if (hasHash) {
        parsed.fragment = withoutQuery;
      }

      return parsed;
    }

    const rank = ['1', '2', '3', '4', '5'],
      file = ['a', 'b', 'c', 'd', 'e'];

    function niceCoords([x,y]) {
      return `${ rank[x] }${ file[y] }`;
    }

    function flattenReduce(acc, arr) {
      return acc.concat(arr);
    }

    return {
      Matrix,
      arrayEquals,
      clone,
      removeFromArray,
      niceName,
      niceCoords,
      parseUrl,
      flattenReduce
    };
  }

  define(['colors'], wrap);
})();
