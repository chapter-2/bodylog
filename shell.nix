{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  name = "bodylog-dev";

  buildInputs = with pkgs; [
    nodejs_20
    bun
    python3
    gcc
    gnumake
  ];

  shellHook = ''
    echo ""
    echo "╔══════════════════════════════════════════╗"
    echo "║      BodyLog — Dev Environment Ready     ║"
    echo "╠══════════════════════════════════════════╣"
    echo "║ Node  $(node --version)                      ║"
    echo "║ Bun   $(bun --version)                         ║"
    echo "╠══════════════════════════════════════════╣"
    echo "║ Commands:                                ║"
    echo "║  bun dev          Start dev server       ║"
    echo "║  bun build        Production build       ║"
    echo "║  bun run generate Static export          ║"
    echo "║  bun run preview  Preview production     ║"
    echo "╠══════════════════════════════════════════╣"
    echo "║ Env:  TURSO_DATABASE_URL + AUTH_TOKEN    ║"
    echo "║ Port: 3000                               ║"
    echo "╚══════════════════════════════════════════╝"
    echo ""

    if [ ! -f .env ]; then
      echo "⚠  No .env found. Copy from .env.example:"
      echo "   cp .env.example .env"
      echo ""
    fi

    if [ ! -d node_modules ]; then
      echo "📦 node_modules missing. Run:"
      echo "   bun install"
      echo ""
    fi
  '';
}
