{ pkgs ? import <nixpkgs> {} }:
let
  onitama = (import ./nix/default.nix) { inherit pkgs; };
in {
  enable = true;
  description = "Onitama";
  unitConfig = {
    Type = "simple";
  };
  serviceConfig = {
    ExecStart = "${pkgs.nodejs-16_x}/bin/node ${onitama}/src/server/index.js";
  };
  wantedBy = [ "multi-user.target" ];
}
