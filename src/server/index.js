var requirejs = require('requirejs');

requirejs.config({
  nodeRequire: require
});

function wrap(path, express, pug, GameSession) {
  const app = express(),
    gameTemplate = pug.compileFile(path.join(__dirname, '../assets/pug/game.pug'));

  app.locals.gameSessions = {};

  app.use('/static', express.static(path.join(__dirname, '../../build/static')));
  
  app.get('/join-game', function(req, res) {
    for (let gid in app.locals.gameSessions) {
      if (app.locals.gameSessions[gid].isAwaitingPlayer()) {
        res.redirect(`/game/${gid}`);
        return;
      }
    }

    const gameSession = new GameSession();
    app.locals.gameSessions[gameSession.id] = gameSession;
    res.redirect(`/game/${gameSession.id}`);
  });

  app.get('/game/:id', function(req, res) {
    const session = app.locals.gameSessions[req.params.id];

    if (session === undefined) {
      res.status(404).send('No such game');
      return;
    }

    const response = gameTemplate({ session });
    res.send(response);
  });

  app.listen(3000, function () {
    console.log('Listening on port 3000');
  });
}

requirejs([
  'path',
  'express',
  'pug',
  'game-session'
], wrap);
