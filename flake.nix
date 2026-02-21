{
  description = "Next.js + Supabase development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
  }:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = import nixpkgs {inherit system;};
    in {
      devShells.default = pkgs.mkShell {
        buildInputs = with pkgs; [
          # Node.js 25.x (latest)
          nodejs_25
          corepack # enables pnpm/yarn without separate install

          # Supabase CLI
          supabase-cli

          # Useful utilities
          jq
          curl
          openssl # for generating secrets
        ];

        shellHook = ''
          echo "🚀 Next.js + Supabase dev environment loaded"
          echo "   Node.js: $(node --version)"
          echo "   Supabase CLI: $(supabase --version)"
          echo ""

          # Enable corepack so pnpm/yarn just work
          export COREPACK_HOME="$HOME/.cache/corepack"
          mkdir -p "$HOME/.local/bin"
          corepack enable --install-directory "$HOME/.local/bin"
          export PATH="$HOME/.local/bin:$PATH"

          # Source secrets if the file exists
          if [ -f .env.local ]; then
            set -a
            source .env.local
            set +a
            echo "✅ Loaded environment variables from .env.local"
          else
            echo "⚠️  No .env.local found — copy .env.local.example and fill in your keys"
          fi
        '';
      };
    });
}
