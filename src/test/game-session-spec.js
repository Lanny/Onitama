;(function() {
  function wrap(GameSession, Mocket) {
    describe('game-session', function() {
      it('should be a constructor', function() {
        expect(typeof GameSession).toBe('function');
      });

      describe('getState', function() {
        it('starts in the "awaiting two more players" state.', function() {
          var gs = new GameSession();
          expect(gs.getState()).toBe('awaiting two more players');
        });
      });

      describe('getName', function() {
        it('starts with no name', function() {
          var gs = new GameSession();
          expect(gs.getName()).toBe('A newly created game');
        });

        it('takes on a full name once two players join', function() {
          var gs = new GameSession();
          gs.acceptParticipant(new Mocket(), 'Alice');
          gs.acceptParticipant(new Mocket(), 'Bob');

          expect(gs.getName()).toBe('Alice vs. Bob');
        });

        it('retains its name, even after abandonment', function() {
          var gs = new GameSession();
          var aliceMocket = new Mocket();
          gs.acceptParticipant(aliceMocket, 'Alice');
          gs.acceptParticipant(new Mocket(), 'Bob');
          aliceMocket.emit('disconnect');

          expect(gs.getName()).toBe('Alice vs. Bob');
        });
      });
    });
  }

  define([
    'game-session',
    'mocket'
  ], wrap);
})();
