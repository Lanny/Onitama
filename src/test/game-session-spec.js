;(function() {
  function wrap(GameSession, Mocket, {WHITE, BLACK, PARTICIPANT}) {
    describe('game-session', function() {
      it('should be a constructor', function() {
        expect(typeof GameSession).toBe('function');
      });

      describe('initialization', function() {
        it('should be constructable with zero arguments', function() {
          expect(() => new GameSession()).not.toThrow();
        });

        it('should init with an id', function() {
          var gs = new GameSession();
          expect(gs.id).not.toBe(undefined);
        });

        it('should be constructable with one argument', function() {
          var ogs = new GameSession(),
            ngs = new GameSession(ogs);

          expect(ngs instanceof GameSession).toBe(true);
        });

        it('shouldn\'t have join codes if inited without a prior session', function() {
          var gs = new GameSession();

          expect(gs.whiteJoinCode).toBe(null);
          expect(gs.blackJoinCode).toBe(null);
        });

        it('should have join codes if inited with a prior session', function() {
          var ogs = new GameSession(),
            ngs = new GameSession(ogs);

          expect(typeof ngs.whiteJoinCode).toBe('string');
          expect(typeof ngs.blackJoinCode).toBe('string');
        });
      });

      describe('joining sequence', function() {
        describe('no prior session case', function() {
          it('accept the first joining player as white', function() {
            var gs = new GameSession(),
              alice = gs.acceptParticipant(new Mocket(), 'Alice');

            expect(alice.color).toBe(WHITE);
          });

          it('accept the second joining player as black', function() {
            var gs = new GameSession(),
              alice = gs.acceptParticipant(new Mocket(), 'Alice'),
              bob = gs.acceptParticipant(new Mocket(), 'Bob');

            expect(bob.color).toBe(BLACK);
          });

          it('accept all following players as no color', function() {
            var gs = new GameSession(),
              alice = gs.acceptParticipant(new Mocket(), 'Alice'),
              bob = gs.acceptParticipant(new Mocket(), 'Bob'),
              cathy = gs.acceptParticipant(new Mocket(), 'Cathy'),
              doug = gs.acceptParticipant(new Mocket(), 'Doug');

            expect(cathy.color).toBe(PARTICIPANT);
            expect(doug.color).toBe(PARTICIPANT);
          });
        });


        describe('prior session case', function() {
          it('accepts a participant joining without a joincode as having no color',
            function() {
              var ogs = new GameSession(),
                gs = new GameSession(ogs),
                alice = gs.acceptParticipant(new Mocket(), 'Alice');

              expect(alice.color).toBe(PARTICIPANT);
            });

          it('accepts a participant joining with a wrong joincode as having no color',
            function() {
              var ogs = new GameSession(),
                gs = new GameSession(ogs),
                alice = gs.acceptParticipant(new Mocket(), 'Alice', 'foobar');

              expect(alice.color).toBe(PARTICIPANT);
            });

          it('accepts a participant joining with the white joincode as white',
            function() {
              var ogs = new GameSession(),
                gs = new GameSession(ogs),
                alice = gs.acceptParticipant(new Mocket(), 'Alice',
                                             gs.whiteJoinCode);

              expect(alice.color).toBe(WHITE);
            });

          it('accepts a participant joining with the black joincode as black',
            function() {
              var ogs = new GameSession(),
                gs = new GameSession(ogs),
                alice = gs.acceptParticipant(new Mocket(), 'Alice',
                                             gs.blackJoinCode);

              expect(alice.color).toBe(BLACK);
            });
        });
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
    'mocket',
    'colors'
  ], wrap);
})();
