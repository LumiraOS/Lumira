# Lumira — Basic Example

Quick start for using Lumira CLI with provider plugins.

## Setup

```bash
# From the repo root
pnpm install
pnpm -r build
```

## Commands

### Check setup
```bash
lumira doctor
```

### Health check a provider
```bash
# Example provider (fake data)
lumira health --provider @lumira/plugin-example

# Bags provider (real Solana RPC)
lumira health --provider @lumira/plugin-bags

# Pump provider (real Solana RPC)
lumira health --provider @lumira/plugin-pump
```

### Check rewards status
```bash
# Example provider
lumira rewards status --provider @lumira/plugin-example

# Bags provider (needs wallet)
lumira rewards status --provider @lumira/plugin-bags --wallet <YOUR_WALLET>

# Pump provider (needs wallet)
lumira rewards status --provider @lumira/plugin-pump --wallet <YOUR_WALLET>
```

### Claim rewards
```bash
# Dry-run (default — safe, no transaction sent)
lumira rewards claim --provider @lumira/plugin-example

# Dry-run with wallet
lumira rewards claim --provider @lumira/plugin-bags --wallet <YOUR_WALLET>

# Actually send (disable dry-run)
lumira rewards claim --provider @lumira/plugin-bags --wallet <YOUR_WALLET> --no-dry-run
```

## Config overrides

```bash
# Use a different RPC
lumira health --provider @lumira/plugin-bags --rpc https://my-rpc.example.com

# Use a different config file
lumira doctor --config ./other-config.json

# Force dry-run on
lumira rewards claim --provider @lumira/plugin-example --dry-run
```

## Audit logs

Every command creates a log file in `./lumira-runs/`:

```
lumira-runs/
  run-20260209-120000.json
  run-20260209-120015.json
```

Each log contains: timestamp, command, provider, dry-run flag, input, and result.
