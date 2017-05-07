;(function() {
  function wrap(utils) {
    describe('utils (isomorphic)', function() {
      it('should exist', function() {
        expect(typeof utils).not.toBe('undefined');
      });

      it('should have a parseUrl function', function() {
        expect(typeof utils.parseUrl).toBe('function');
      });

      it('\'s pareUrl function should parse urls', function() {
        var parsed = utils.parseUrl(
          'https://onitama.lannysport.net/foo/bar?jc=foo&_=bar#foo');

        expect(parsed.protocol).toBe('https');
        expect(parsed.host).toBe('onitama.lannysport.net');
        expect(parsed.path).toBe('foo/bar');
        expect(parsed.query.jc[0]).toBe('foo');
        expect(parsed.query._[0]).toBe('bar');
        expect(parsed.query.notaparam).toBe(undefined);
        expect(parsed.fragment).toBe('foo');
      });

      it('\'s pareUrl function handles absent queries', function() {
        var parsed = utils.parseUrl(
          'https://onitama.lannysport.net/foo/bar#foo');
        expect(parsed.query).toBe(undefined);
        expect(parsed.fragment).toBe('foo');
      });

      it('\'s pareUrl function handles absent hashes', function() {
        var parsed = utils.parseUrl(
          'https://onitama.lannysport.net/foo/bar');
        expect(parsed.query).toBe(undefined);
        expect(parsed.fragment).toBe(undefined);
      });

    });
  }

  define([
    'utils'
  ], wrap);
})();
