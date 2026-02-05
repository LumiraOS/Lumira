<!-- prompts.md -->
# Lumira — Prompts (Cursor / Claude Code)

This file is Lumira’s flight plan.
Rule: run **one prompt at a time**, test, then move forward.

---

## Current status (already done ✅)

### Infra / monorepo
- pnpm workspaces monorepo is created and working.
- Structure:
  - `packages/plugin-types`
  - `packages/core`
  - `packages/cli`
- `pnpm install` ✅
- `pnpm -r build` ✅ (TypeScript compiles for all packages)
- CLI runs in dev mode:
  - `pnpm --filter @lumira/cli dev doctor` ✅

### TypeScript fix
- `tsconfig.base.json` is “clean” (no global rootDir/outDir).
- Each package has its own `tsconfig.json` with:
  - `"rootDir": "src"`
  - `"outDir": "dist"`

### Existing CLI
- `doctor` works and prints:
  - Node version
  - default RPC
  - default dry-run = true
  - hint: add provider plugin
- There is also a `health` command that expects `--provider <pkg>` (no real provider yet).

---

## Implementation rules (do not break)
- Don’t change what already works without a clear reason.
- For every new feature:
  - compile (`pnpm -r build`)
  - run at least one CLI command in dev mode
- Prefer safe defaults (dry-run ON).
- No secrets in logs / repo.

---

# PROMPTS

## Prompt 01 — (DONE) Scaffold monorepo + TS base
Status: ✅ DONE  
Notes: monorepo and build already work.

---

## Prompt 02 — Real config + `lumira init` + make `lumira doctor` read config
**Goal**
Make Lumira “project-based” by creating and reading `lumira.config.json`.

**Ask the Agent**
Implement a new CLI command: `lumira init`

Requirements:
- Create `lumira.config.json` in the current working directory.
- If it already exists, do not overwrite; print a friendly warning.
- Minimal config content:
  - `network`: `"solana-mainnet"`
  - `rpcUrl`: `"https://api.mainnet-beta.solana.com"`
  - `defaults`: `{ "dryRun": true }`
- Output: print the config path and “Project initialized”.
- **No RPC calls** (filesystem only).

Then update `lumira doctor` to:
- look for `lumira.config.json`
- if present, read + print values (network/rpc/dryRun)
- if missing, suggest running `lumira init`

**Done criteria**
- `pnpm --filter @lumira/cli dev init` creates config
- `pnpm --filter @lumira/cli dev doctor` reads config and prints values

---

## Prompt 03 — Config overrides (flags)
**Goal**
Allow runtime overrides without editing files.

**Ask the Agent**
Add CLI flags:
- `--config <path>` (default `./lumira.config.json`)
- `--rpc <url>` (runtime override)
- `--dry-run` and `--no-dry-run`

`doctor` must show which values come from config vs overrides.

**Done criteria**
- `dev doctor --rpc ...` uses override
- `dev doctor --config other.json` uses a different config file

---

## Prompt 04 — Provider system v1 (local “example” plugin)
**Goal**
Have 1 working provider to validate the plugin contract.

**Ask the Agent**
Create package `packages/plugin-example`:

- Name: `@lumira/plugin-example`
- Export `createProvider()` matching `@lumira/plugin-types`
- Implement:
  - `health()` -> `{ ok: true, details: { provider: "example" } }`
  - `rewards.status()` -> fake list
  - `rewards.claim()` -> returns `dryRun: true/false` and `sent: false/true` with no real txs
- Manifest optional for now (v1 simple)

Update CLI to allow:
- `lumira health --provider @lumira/plugin-example`

**Done criteria**
- `pnpm -r build` passes
- `pnpm --filter @lumira/cli dev health --provider @lumira/plugin-example` works

---

## Prompt 05 — Plugin manifest + loader (v2)
**Goal**
Standardize plugins and enable validation.

**Ask the Agent**
Add `lumira.plugin.json` to each plugin:
- name, version, permissions, networks, features

In core:
- upgrade `loadProvider()` to:
  - import the package
  - validate `createProvider` export
  - validate `provider.manifest` exists and matches `lumira.plugin.json` (if present)
  - return a clear, user-friendly error on failure

**Done criteria**
- plugin-example has a manifest
- loader validates it
- CLI shows friendly errors when contract is missing

---

## Prompt 06 — Audit log (v1)
**Goal**
Every action produces a run log.

**Ask the Agent**
In core:
- implement `createRunLogger()` writing to `./lumira-runs/run-YYYYMMDD-HHMMSS.json`
- log must include:
  - timestamp
  - command/action
  - provider
  - dryRun
  - input
  - result (success/error)

In CLI:
- integrate audit logging for `health`, then for new commands.

**Done criteria**
- running `health` creates a log file under `lumira-runs/`
- file contains provider/action/result

---

## Prompt 07 — Rewards commands in CLI
**Goal**
Main UX: `rewards status` and `rewards claim`.

**Ask the Agent**
Add commands:
- `lumira rewards status --provider <pkg>`
- `lumira rewards claim --provider <pkg> [--dry-run|--no-dry-run]`

Wire them into core runner + audit logs.

**Done criteria**
- with plugin-example, `rewards status/claim` work

---

## Prompt 08 — Bags plugin (MVP rewards)
**Goal**
First real provider (Bags) for rewards only.

**Ask the Agent**
Create `@lumira/plugin-bags` with:
- `rewards.status`
- `rewards.claim` (dry-run + confirmation)
- short step-based output

**Done criteria**
- `lumira rewards status --provider @lumira/plugin-bags` works
- `claim --dry-run` does not send
- audit log includes results

---

## Prompt 09 — Pump plugin (MVP creator fee claim)
**Goal**
Creator fee claiming.

**Ask the Agent**
Create `@lumira/plugin-pump` with:
- `rewards.claim` for creator fees (start with the most stable approach)
- minimal `rewards.status`
- confirmations + audit log

**Done criteria**
- `claim --dry-run` works
- `claim` with confirmation works

---

## Prompt 10 — Polishing (UX + docs)
- better output formatting
- `examples/basic`
- architecture docs

---

## Prompt 11 — Release prep
- LICENSE
- CONTRIBUTING
- SECURITY
- GitHub Actions build/test
- tag `v0.1.0-alpha`

---
