# Contributing to Lumira

Thanks for your interest in contributing to Lumira!

## Getting Started

```bash
git clone https://github.com/LumiraOS/Lumira.git
cd Lumira
pnpm install
pnpm -r build
```

## Development

```bash
# Run CLI in dev mode
pnpm --filter @lumira/cli dev <command>

# Build all packages
pnpm -r build

# Example: test health check
pnpm --filter @lumira/cli dev health --provider @lumira/plugin-example
```

## Project Structure

```
packages/
  plugin-types/   — Shared types (Provider, LumiraContext, etc.)
  core/           — Plugin loading, validation, runners, audit logging
  cli/            — CLI commands (init, doctor, health, rewards)
  plugin-example/ — Example provider with fake data
  plugin-bags/    — Bags provider (Solana stake rewards)
  plugin-pump/    — Pump provider (creator fee claiming)
examples/
  basic/          — Basic usage example with config
```

## Creating a Plugin

1. Create a new package under `packages/`
2. Add `@lumira/plugin-types` as a dependency
3. Export `createProvider()` returning a `Provider` object
4. Add a `lumira.plugin.json` manifest
5. Implement `health()`, `rewards.status()`, and `rewards.claim()`

See `packages/plugin-example` for a minimal reference.

## Guidelines

- Run `pnpm -r build` before submitting
- Keep dry-run as the safe default
- No secrets in code or logs
- Add audit logging for new commands
- Test with both `--dry-run` and `--no-dry-run`

## Reporting Issues

Open an issue at https://github.com/LumiraOS/Lumira/issues
