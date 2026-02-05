# Lumira — STATE (Single Source of Truth)

This file is the **one** document the coding agent must read first.
Purpose: keep Lumira consistent across multi-day prompt sessions.

---

## 1) Project identity
- Name: **Lumira**
- Org/Repo: `LumiraOS/Lumira`
- Goal: Node.js + TypeScript **plugin framework + CLI** for safe onchain workflows
  - MVP focus: **rewards status + claim**
  - Later: launch + swaps

---

## 2) Non-negotiable rules
- Do **not** break existing working commands.
- Safe defaults:
  - dry-run ON for critical actions
  - confirmations for sending
- No secrets in logs or repo.
- After each change:
  - `pnpm -r build`
  - run at least one CLI command in dev mode

---

## 3) Current implementation snapshot (what already exists ✅)

### Monorepo
- pnpm workspace is set up.
- Packages:
  - `@lumira/plugin-types`
  - `@lumira/core`
  - `@lumira/cli`

### Build
- `pnpm install` ✅
- `pnpm -r build` ✅ (TypeScript compiles across packages)

### TypeScript config
- Root `tsconfig.base.json` does NOT define rootDir/outDir.
- Each package `tsconfig.json` sets:
  - `"rootDir": "src"`
  - `"outDir": "dist"`

### CLI
- Runs in dev:
  - `pnpm --filter @lumira/cli dev doctor` ✅
  - `pnpm --filter @lumira/cli dev init` ✅
- Commands currently exist:
  - `init` (creates `lumira.config.json`; warns if already exists)
  - `doctor` (reads config if present, prints Node/network/RPC/dry-run; suggests init if missing)
  - `health` (requires `--provider <pkg>`; no real provider installed yet)

### Core
- `loadProvider(pkgName)` dynamic imports provider package, expects export `createProvider()`.
- Runners:
  - `runHealth(ctx, providerPkg)`
  - `runRewardsStatus(ctx, providerPkg, input)`
  - `runRewardsClaim(ctx, providerPkg, input)`

### plugin-types
- Defines Provider interface (health + rewards.status/claim) and basic types.

---

## 4) What is NEXT (current objective)
**Add CLI flag overrides for config.**

### Next prompt to execute
- **Prompt 03 from `prompts.md`:**
  - Add `--config <path>` flag (default `./lumira.config.json`)
  - Add `--rpc <url>` runtime override
  - Add `--dry-run` and `--no-dry-run` flags
  - `doctor` must show which values come from config vs overrides

---

## 5) Definition of done for the NEXT objective
- `dev doctor --rpc ...` uses override
- `dev doctor --config other.json` uses a different config file
- `pnpm -r build` passes

---

## 6) Session Kickoff Prompt (copy/paste into Claude Code)
> Read STATE.md first and follow it strictly.
> Do NOT refactor unrelated parts.
> Execute **Prompt 03** from prompts.md.
> After implementing, run: `pnpm -r build`, then test with `--rpc` and `--config` flags.
> Report what changed and what command outputs are expected.

---

## 7) Session log (update after each session)
### Last known state
- Build: ✅
- CLI doctor: ✅
- CLI init: ✅
- Next: Prompt 03 (config overrides/flags)

### Notes / issues
- Node is v25.x; `corepack` missing but pnpm works via npm. Not blocking.
- Prompt 02 completed: `lumira init` and `lumira doctor` with config reading work.

---
