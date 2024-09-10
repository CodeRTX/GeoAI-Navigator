{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = [
    pkgs.git-filter-repo
  ];

  shellHook = ''
    echo "git-filter-repo has been added to your environment."
  '';
}