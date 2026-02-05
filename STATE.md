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
- `loadProvider(pkgName)` dynamic imports provider package with full validation:
  - Validates `createProvider()` export exists
  - Validates provider has required `manifest` property
  - Validates manifest structure (name, version, permissions, networks, features)
  - Validates required methods (`health()`, `rewards.status()`, `rewards.claim()`)
  - Returns user-friendly error messages on validation failure
- Runners:
  - `runHealth(ctx, providerPkg)`
  - `runRewardsStatus(ctx, providerPkg, input)`
  - `runRewardsClaim(ctx, providerPkg, input)`

### plugin-types
- Defines Provider interface (health + rewards.status/claim) and basic types.

### plugin-example
- First working provider plugin with fake data.
- Has `lumira.plugin.json` manifest file.
- Implements full Provider interface:
  - `health()` returns `{ ok: true, details: { provider: "example" } }`
  - `rewards.status()` returns fake rewards list
  - `rewards.claim()` respects dry-run flag, returns fake signatures
- Passes all manifest validations.

---

## 4) What is NEXT (current objective)
**Add audit logging for all actions.**

### Next prompt to execute
- **Prompt 06 from `prompts.md`:**
  - Implement `createRunLogger()` writing to `./lumira-runs/`
  - Log timestamp, command, provider, dryRun, input, result
  - Integrate audit logging into CLI commands

---

## 5) Definition of done for the NEXT objective
- `pnpm -r build` passes
- Running `health` creates a log file under `lumira-runs/`
- Log contains provider, action, and result

---

## 6) Session Kickoff Prompt (copy/paste into Claude Code)
> Read STATE.md first and follow it strictly.
> Do NOT refactor unrelated parts.
> Execute **Prompt 06** from prompts.md.
> After implementing, run: `pnpm -r build`, then test audit logging.
> Report what changed and what command outputs are expected.

---

## 7) Session log (update after each session)
### Last known state
- Build: ✅
- CLI doctor: ✅ (with config overrides)
- CLI init: ✅
- CLI health: ✅ (with @lumira/plugin-example + manifest validation)
- Next: Prompt 06 (audit logging)

### Notes / issues
- Node is v25.x; `corepack` missing but pnpm works via npm. Not blocking.
- Prompt 02 completed: `lumira init` and `lumira doctor` with config reading work.
- Prompt 03 completed: Config overrides via `--config`, `--rpc`, `--dry-run`, `--no-dry-run` work.
- Prompt 04 completed: `@lumira/plugin-example` package created. Health command works with example provider. Note: Added plugin-example as devDependency to core for dynamic import resolution in monorepo.
- Prompt 05 completed: Added `lumira.plugin.json` manifest file. Upgraded `loadProvider()` with comprehensive validation (manifest structure, required methods). Returns user-friendly error messages for invalid providers.

---
