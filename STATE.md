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
  - `@lumira/plugin-example`

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
- Global flags:
  - `--config <path>` (default: `./lumira.config.json`)
  - `--rpc <url>` (runtime override)
  - `--dry-run` / `--no-dry-run` (runtime override)
- Commands currently exist:
  - `init` (creates `lumira.config.json`; warns if already exists)
  - `doctor` (reads config if present, shows config vs override sources, prints Node/network/RPC/dry-run; suggests init if missing)
  - `health` (requires `--provider <pkg>`; uses resolved config with overrides; no real provider installed yet)

### Core
- `loadProvider(pkgName)` dynamic imports provider package, expects export `createProvider()`.
- Runners:
  - `runHealth(ctx, providerPkg)`
  - `runRewardsStatus(ctx, providerPkg, input)`
  - `runRewardsClaim(ctx, providerPkg, input)`

### plugin-types
- Defines Provider interface (health + rewards.status/claim) and basic types.

### plugin-example
- First working provider plugin with fake data.
- Implements full Provider interface:
  - `health()` returns `{ ok: true, details: { provider: "example" } }`
  - `rewards.status()` returns fake rewards list
  - `rewards.claim()` respects dry-run flag, returns fake signatures

---

## 4) What is NEXT (current objective)
**Add plugin manifest + loader validation.**

### Next prompt to execute
- **Prompt 05 from `prompts.md`:**
  - Add `lumira.plugin.json` to each plugin
  - Upgrade `loadProvider()` to validate manifest and exports
  - Return user-friendly errors on validation failure

---

## 5) Definition of done for the NEXT objective
- `pnpm -r build` passes
- plugin-example has manifest validation
- `lumira health` shows friendly error if provider contract is invalid

---

## 6) Session Kickoff Prompt (copy/paste into Claude Code)
> Read STATE.md first and follow it strictly.
> Do NOT refactor unrelated parts.
> Execute **Prompt 05** from prompts.md.
> After implementing, run: `pnpm -r build`, then test manifest validation.
> Report what changed and what command outputs are expected.

---

## 7) Session log (update after each session)
### Last known state
- Build: ✅
- CLI doctor: ✅ (with config overrides)
- CLI init: ✅
- CLI health: ✅ (with @lumira/plugin-example)
- Next: Prompt 05 (manifest validation)

### Notes / issues
- Node is v25.x; `corepack` missing but pnpm works via npm. Not blocking.
- Prompt 02 completed: `lumira init` and `lumira doctor` with config reading work.
- Prompt 03 completed: Config overrides via `--config`, `--rpc`, `--dry-run`, `--no-dry-run` work.
- Prompt 04 completed: `@lumira/plugin-example` package created. Health command works with example provider. Note: Added plugin-example as devDependency to core for dynamic import resolution in monorepo.

---
