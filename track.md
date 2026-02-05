# Lumira — Track

## Prompt 02 ✅
Added `lumira init` to create `lumira.config.json` with safe defaults (solana-mainnet, public RPC, dryRun: true). Updated `lumira doctor` to read and display config values or suggest running init if missing.

**Commit:**
```
feat(cli): add project config initialization and reading

Implement `lumira init` command to create lumira.config.json with safe
defaults (solana-mainnet, public RPC, dryRun: true). Config file is not
overwritten if it already exists.

Update `lumira doctor` to read and display config values when present,
or suggest running `lumira init` if config file is missing.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

---

## Prompt 03 ✅
Added global CLI flags for runtime config overrides: `--config <path>`, `--rpc <url>`, `--dry-run`, `--no-dry-run`. Updated `doctor` and `health` commands to use resolved config that merges file config with CLI overrides, showing the source of each value (config/override/default).

**Commit:**
```

Add global flags --config, --rpc, --dry-run, and --no-dry-run to allow
runtime overrides without editing config files. Implement resolveConfig()
to merge config file with CLI overrides.

Update doctor command to display the source of each value (config,
override, or default). Update health command to use resolved config.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

---

## Prompt 04 ✅
Created `@lumira/plugin-example` package with full Provider implementation using fake data. Implements health check, rewards status, and rewards claim methods. The example provider validates the plugin contract and demonstrates how external providers should be structured.

**Note:** Added plugin-example as devDependency to @lumira/core to enable dynamic import resolution in pnpm workspace (Node.js requires the package to be in node_modules of the importing module's context).

**Commit:**
```
feat(plugin-example): add example provider plugin

Create @lumira/plugin-example package implementing the full Provider
interface with fake data for testing and validation:
- health() returns success with provider details
- rewards.status() returns fake reward items
- rewards.claim() respects dry-run flag and returns fake signatures

Add plugin-example as devDependency to core and cli for dynamic import
resolution in pnpm workspace.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

---

## Prompt 05 ✅
Added plugin manifest system with comprehensive validation. Created `lumira.plugin.json` for plugin-example and upgraded `loadProvider()` to validate provider structure, manifest completeness, and required methods. The loader now returns user-friendly error messages when plugins don't meet the contract requirements.

**Validation checks:**
- `createProvider()` export exists
- Provider object is returned (not null/undefined)
- Manifest property exists
- Manifest has required fields: name, version, permissions, networks, features
- Required methods exist: `health()`, `rewards.status()`, `rewards.claim()`

**Commit:**
```
feat(core): add plugin manifest validation system

Add lumira.plugin.json manifest file to plugin-example containing name,
version, permissions, networks, and features.

Upgrade loadProvider() in core to perform comprehensive validation:
- Validate createProvider() export exists
- Validate provider structure and manifest property
- Validate manifest completeness (name, version, permissions, etc)
- Validate required methods (health, rewards.status, rewards.claim)
- Return user-friendly error messages for each validation failure

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

---
