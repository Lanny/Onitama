;(function() {
  function wrap(GameSession) {
    describe('game-session', function() {
      it('should be a constructor', function() {
        expect(typeof GameSession).toBe('function');
      })
    });
  }

  define(['game-session'], wrap);
})();
