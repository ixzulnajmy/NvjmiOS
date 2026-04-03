#!/bin/bash
# NvjmiOS — Full repo + worktree setup
# Run this once from your home directory: bash setup-nvjmios.sh

set -e

AGENTS=(iris deen avicenna mizan elon linus wafa davinci wayne)
REPO="nvjmios"
BASE=$(pwd)

echo "==> Creating nvjmios repo..."
mkdir -p $REPO && cd $REPO
git init
git checkout -b main

echo "==> Creating folder structure..."
mkdir -p agents/nvjmi agents/iris agents/deen agents/avicenna agents/mizan agents/elon agents/linus agents/wafa agents/davinci agents/wayne
mkdir -p projects finance notes scripts

echo "==> Copying agent CLAUDE.md files..."
# Copy your generated .md files here
# Assumes you've placed them in ~/nvjmios-context/ first
# e.g. cp ~/nvjmios-context/agents/nvjmi/NVJMI.md agents/nvjmi/CLAUDE.md

echo ""
echo "  ACTION REQUIRED: Copy your .md files into agents/[name]/CLAUDE.md"
echo "  Example:"
echo "    cp ~/Downloads/agents/nvjmi/NVJMI.md agents/nvjmi/CLAUDE.md"
echo "    cp ~/Downloads/agents/iris/IRIS.md agents/iris/CLAUDE.md"
echo "    ... (repeat for all 10 agents)"
echo ""

# Create root CLAUDE.md for the repo
cat > CLAUDE.md << 'EOF'
# NvjmiOS — Root Context

This is the NvjmiOS council repo. NVJMI runs on main. Council agents run on their own branches via worktrees.

## Agent map
- main → agents/nvjmi/CLAUDE.md (NVJMI — master agent, entry point)
- iris → agents/iris/CLAUDE.md
- deen → agents/deen/CLAUDE.md
- avicenna → agents/avicenna/CLAUDE.md
- mizan → agents/mizan/CLAUDE.md
- elon → agents/elon/CLAUDE.md
- linus → agents/linus/CLAUDE.md
- wafa → agents/wafa/CLAUDE.md
- davinci → agents/davinci/CLAUDE.md
- wayne → agents/wayne/CLAUDE.md

## Worktree paths
../nvjmios-iris, ../nvjmios-deen, ../nvjmios-avicenna, ../nvjmios-mizan
../nvjmios-elon, ../nvjmios-linus, ../nvjmios-wafa, ../nvjmios-davinci, ../nvjmios-wayne

## Session end protocol
git add . && git commit -m "session: [description]" && git push origin [branch]
EOF

# Create .gitignore
cat > .gitignore << 'EOF'
.env
.env.local
.DS_Store
node_modules/
EOF

# Create .env template
cat > .env.template << 'EOF'
SUPABASE_URL=
SUPABASE_ANON_KEY=
EOF

echo "==> Initial commit..."
git add .
git commit -m "init: nvjmios council — phase 0 complete"

echo ""
echo "==> NEXT: Push to GitHub"
echo "  1. Create private repo at github.com/new (name: nvjmios)"
echo "  2. Run:"
echo "     git remote add origin git@github.com:YOUR_USERNAME/nvjmios.git"
echo "     git push -u origin main"
echo ""

echo "==> Creating agent branches + worktrees..."
cd $BASE

for AGENT in "${AGENTS[@]}"; do
  echo "  Creating branch + worktree for: $AGENT"
  cd $REPO
  git checkout -b $AGENT
  git checkout main
  cd $BASE
  git -C $REPO worktree add ../${REPO}-${AGENT} $AGENT
done

echo ""
echo "==> Worktree list:"
git -C $REPO worktree list

echo ""
echo "======================================"
echo "NvjmiOS repo setup complete."
echo ""
echo "Repo:      $BASE/$REPO"
echo "Worktrees: $BASE/${REPO}-[agent] for each council member"
echo ""
echo "To start a session with NVJMI:"
echo "  cd $BASE/$REPO && claude"
echo ""
echo "To spawn a council agent:"
echo "  cd $BASE/${REPO}-iris && claude"
echo "======================================"
