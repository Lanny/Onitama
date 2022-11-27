{ pkgs ? import <nixpkgs> {} }:
let
  nodejs = pkgs.nodejs-16_x;
  nodeDependencies = (pkgs.callPackage ./deps.nix { inherit nodejs; }).nodeDependencies;
in
pkgs.stdenv.mkDerivation rec {
  name = "Onitama";
  src = ./..;
  buildInputs = [ nodejs ];
  buildPhase = ''
    ln -s ${nodeDependencies}/lib/node_modules ./node_modules
    export PATH="${nodeDependencies}/bin:$PATH"

    ${nodejs}/bin/node node_modules/gulp-cli/bin/gulp.js generate

    mkdir -p $out/build
    cp -r ./* $out/
  '';

  onitama-server = pkgs.writeShellScriptBin "onitama-server" ''
    ${nodejs}/bin/node ../src/server/index.js
  '';

  installPhase = ''
    mkdir -p $out/bin
    cp -r ${onitama-server}/bin/onitama-server $out/bin/onitama-server
  '';
}

