# Onitama

Onitama is a two player abstract strategy game. It is published in the US by [Arcane Wonders](https://www.arcanewonders.com/onitama). This project implements lobbying and netplay of the game.

You can play online [here](http://onitama.lannysport.net/).

## Development Setup
```
npm install
npm install -g gulp-cli # If you haven't installed gulp-cli before
gulp server

* Requires node version 6 or higher to support es6 *
```

And navigate to localhost:3000

## Nix

Hey, there's a nix derivation for onitama! That's cool. It's in the `nix` directory. When the deps are updated, the derivation needs to be updated like so:

```
nix-shell -p node2nix
node2nix --input package.json -l package-lock.json --output nix/package-lock.nix --composition nix/deps.nix --node-env nix/node-env.nix
```

There's also a `service.nix` file you might find useful to deploy an instance.
