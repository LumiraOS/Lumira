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
  - `@lumira/plugin-bags`
  - `@lumira/plugin-pump`

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
  - `health` (requires `--provider <pkg>`; uses resolved config with overrides; creates audit log in `./lumira-runs/`)
  - `rewards status` (requires `--provider <pkg>`; optional `--wallet <address>`; displays rewards list with audit logging)
  - `rewards claim` (requires `--provider <pkg>`; optional `--wallet <address>`; claims rewards with dry-run support and audit logging)

### Core
- `loadProvider(pkgName)` dynamic imports provider package with full validation:
  - Validates `createProvider()` export exists
  - Validates provider has required `manifest` property
  - Validates manifest structure (name, version, permissions, networks, features)
  - Validates required methods (`health()`, `rewards.status()`, `rewards.claim()`)
  - Returns user-friendly error messages on validation failure
- `createRunLogger(baseDir)` audit logging system:
  - Writes to `./lumira-runs/run-YYYYMMDD-HHMMSS.json`
  - Logs: timestamp, command, provider, dryRun, input, result (success/error)
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

### plugin-bags
- First real Solana provider using `@solana/web3.js`.
- Has `lumira.plugin.json` manifest file (permissions: read, sign, send).
- Implements full Provider interface:
  - `health()` pings RPC endpoint, returns Solana core version
  - `rewards.status()` fetches stake accounts for a wallet address via RPC
  - `rewards.claim()` builds withdraw instructions, respects dry-run, step-based output
- Wallet signing not yet implemented (claim builds tx but does not send).

### plugin-pump
- Creator fee claiming provider using `@solana/web3.js` + `@solana/spl-token`.
- Has `lumira.plugin.json` manifest file (permissions: read, sign, send; networks: solana-mainnet only).
- Implements full Provider interface:
  - `health()` pings RPC, verifies Pump program exists on-chain
  - `rewards.status()` scans token accounts for empty (zero-balance) reclaimable accounts
  - `rewards.claim()` builds close-account instructions to reclaim rent SOL, step-based output
- Wallet signing not yet implemented (claim builds tx but does not send).

---

## 4) What is NEXT (current objective)
**All prompts complete!** v0.1.0-alpha tagged and released.

### Future work
- Wallet signing integration
- More providers
- npm publishing

---

## 5) Definition of done
All 11 prompts completed. v0.1.0-alpha tagged.

---

## 6) Session Kickoff Prompt (copy/paste into Claude Code)
> Read STATE.md first. All prompts are done.
> Focus on bug fixes, new features, or wallet signing integration.

---

## 7) Session log (update after each session)
### Last known state
- Build: ✅
- CLI doctor: ✅ (with config overrides)
- CLI init: ✅
- CLI health: ✅ (plugin-example, plugin-bags, plugin-pump)
- CLI rewards: ✅ (status + claim with --wallet flag, audit logging)
- Bags health: ✅ (connects to Solana mainnet RPC)
- Pump health: ✅ (connects to RPC, verifies Pump program on-chain)
- Formatted output: ✅ (headers, separators, icons, structured display)
- examples/basic: ✅
- Release files: ✅ (LICENSE, CONTRIBUTING, SECURITY)
- GitHub Actions CI: ✅
- Tag: v0.1.0-alpha ✅
- Status: ALL PROMPTS COMPLETE

### Notes / issues
- Node is v25.x; `corepack` missing but pnpm works via npm. Not blocking.
- Prompt 02 completed: `lumira init` and `lumira doctor` with config reading work.
- Prompt 03 completed: Config overrides via `--config`, `--rpc`, `--dry-run`, `--no-dry-run` work.
- Prompt 04 completed: `@lumira/plugin-example` package created. Health command works with example provider. Note: Added plugin-example as devDependency to core for dynamic import resolution in monorepo.
- Prompt 05 completed: Added `lumira.plugin.json` manifest file. Upgraded `loadProvider()` with comprehensive validation (manifest structure, required methods). Returns user-friendly error messages for invalid providers.
- Prompt 06 completed: Implemented `createRunLogger()` in core. Integrated audit logging into health command. Every run creates a timestamped JSON log in `./lumira-runs/` with command, provider, dryRun, and result (success/error).
- Prompt 07 completed: Added `rewards status` and `rewards claim` commands to CLI. Both commands integrate with audit logging. Claim command respects dry-run flag (default ON). Tested with plugin-example showing fake rewards data.
- Prompt 08 completed: Created `@lumira/plugin-bags` using `@solana/web3.js`. Health pings RPC. Rewards status fetches stake accounts. Claim builds withdraw instructions with step-based output. Added `--wallet` flag to CLI rewards commands. Wallet signing not yet implemented.
- Prompt 09 completed: Created `@lumira/plugin-pump` using `@solana/web3.js` + `@solana/spl-token`. Health verifies Pump program on-chain. Rewards status scans for empty token accounts with reclaimable rent. Claim builds close-account instructions with step-based output. Wallet signing not yet implemented.
- Prompt 10 completed: Polished CLI output with formatted headers, separators, icons. Added formatHealth/formatRewardsStatus/formatClaimResult helpers. Created `examples/basic` with config and README. Errors no longer throw raw stack traces.
- Prompt 11 completed: Added LICENSE (MIT), CONTRIBUTING.md, SECURITY.md. Added GitHub Actions CI workflow (Node 20+22, pnpm install + build). Tagged v0.1.0-alpha.

---
