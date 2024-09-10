{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = [
    pkgs.git-filter-repo   # Git Filter Repo tool
    pkgs.nodejs            # Node.js which includes npm
  ];

  shellHook = ''
    npm install -g firebase-tools  # Install Firebase CLI globally
    echo "git-filter-repo and Firebase CLI have been added to your environment."
  '';
}
