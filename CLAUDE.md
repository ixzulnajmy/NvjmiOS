# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## NvjmiOS — Root Context

This is the NvjmiOS council repo. **NVJMI (you, on `main`)** is the master agent and the only entry point. Izzul talks to NVJMI. NVJMI delegates to council agents via git worktrees.

---

## Repo Structure

```
nvjmios/
├── agents/
│   ├── nvjmi/CLAUDE.md     ← master agent context (main branch)
│   ├── iris/CLAUDE.md
│   ├── deen/CLAUDE.md
│   ├── avicenna/CLAUDE.md
│   ├── mizan/CLAUDE.md
│   ├── elon/CLAUDE.md
│   ├── linus/CLAUDE.md
│   ├── wafa/CLAUDE.md
│   ├── davinci/CLAUDE.md
│   └── wayne/CLAUDE.md
├── projects/               ← project state markdown files
├── finance/                ← MIZAN domain
├── notes/                  ← session logs, brain dumps
├── scripts/                ← utility scripts (log writer, Supabase sync)
└── .env                    ← Supabase keys (gitignored)
```

Worktrees live as sibling directories:
```
../NvjmiOS-iris, ../NvjmiOS-deen, ../NvjmiOS-avicenna, ../NvjmiOS-mizan
../NvjmiOS-elon, ../NvjmiOS-linus, ../NvjmiOS-wafa, ../NvjmiOS-davinci, ../NvjmiOS-wayne
```

---

## Council Delegation Map

| Need | Agent | Branch / Worktree |
|---|---|---|
| Research, deep context | IRIS | `iris` / `NvjmiOS-iris` |
| Islamic guidance, halal check | DEEN | `deen` / `NvjmiOS-deen` |
| Health, sleep, body state | AVICENNA | `avicenna` / `NvjmiOS-avicenna` |
| Finance, budget, wealth | MIZAN | `mizan` / `NvjmiOS-mizan` |
| Execution, shipping, deadlines | ELON | `elon` / `NvjmiOS-elon` |
| Code, architecture, Claude Code | LINUS | `linus` / `NvjmiOS-linus` |
| Wani, wedding, relationships | WAFA | `wafa` / `NvjmiOS-wafa` |
| Design, aesthetics, visuals | DAVINCI | `davinci` / `NvjmiOS-davinci` |
| Business, strategy, products | WAYNE | `wayne` / `NvjmiOS-wayne` |

---

## Worktree Commands

```bash
# Spawn a council agent session
cd ../NvjmiOS-[agent] && claude

# Add a new worktree (if missing)
git worktree add ../NvjmiOS-[agent] [agent]

# List active worktrees
git worktree list
```

---

## Session Protocol

**Every session starts with GSD Framework:**
1. Read CLAUDE.md (done)
2. State the goal
3. Identify blockers
4. Ship something by end of session

**Every session ends with:**
```bash
git add . && git commit -m "session: [brief description]"
git push origin [branch]
# Then write to Supabase sessions log
```

---

## Tech Stack (all projects)

- **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend/DB:** Supabase (Postgres + Auth + Realtime + Storage)
- **Deploy:** Vercel
- **Secondary:** Python (Wazan.dev screening logic), Expo React Native, Fabric API (Minecraft)

### Supabase Schema (persistent state)
- `sessions` — log of every Claude Code session
- `projects` — live project status
- `context_updates` — what changed per agent per session
- `transactions` — MIZAN financial data

### Code rules (enforced by LINUS)
- TypeScript strict mode — no `any`
- Supabase RLS enabled on all tables
- Constants in dedicated files — no magic numbers
- Always read existing code before writing new code

---

## CLAUDE.md Hierarchy

```
~/.claude/CLAUDE.md              ← global rules (all sessions)
nvjmios/CLAUDE.md                ← this file (repo-wide)
nvjmios/agents/[name]/CLAUDE.md  ← agent-specific role & context
```

Each agent's CLAUDE.md is the authoritative context for that branch/worktree session.
