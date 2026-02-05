#!/usr/bin/env node
import { Command } from "commander";
import { runHealth } from "@lumira/core";
import type { LumiraContext } from "@lumira/plugin-types";
import * as fs from "node:fs";
import * as path from "node:path";

interface LumiraConfig {
  network: string;
  rpcUrl: string;
  defaults: {
    dryRun: boolean;
  };
}

const CONFIG_FILE = "lumira.config.json";

function getConfigPath(): string {
  return path.join(process.cwd(), CONFIG_FILE);
}

function loadConfig(): LumiraConfig | null {
  const configPath = getConfigPath();
  if (!fs.existsSync(configPath)) {
    return null;
  }
  const raw = fs.readFileSync(configPath, "utf-8");
  return JSON.parse(raw) as LumiraConfig;
}

const program = new Command();

program
  .name("lumira")
  .description("Lumira — plugin framework + CLI for safe onchain workflows")
  .version("0.0.0");

program
  .command("init")
  .description("Initialize a new Lumira project (creates lumira.config.json)")
  .action(async () => {
    const configPath = getConfigPath();
    if (fs.existsSync(configPath)) {
      console.log(`⚠️  Config already exists: ${configPath}`);
      console.log("   Remove it first if you want to reinitialize.");
      return;
    }
    const config: LumiraConfig = {
      network: "solana-mainnet",
      rpcUrl: "https://api.mainnet-beta.solana.com",
      defaults: {
        dryRun: true
      }
    };
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");
    console.log(`✅ Created: ${configPath}`);
    console.log("   Project initialized.");
  });

program
  .command("doctor")
  .description("Check basic setup")
  .action(async () => {
    console.log("✅ Node:", process.version);

    const config = loadConfig();
    if (config) {
      console.log("✅ Config: lumira.config.json found");
      console.log("   Network:", config.network);
      console.log("   RPC:", config.rpcUrl);
      console.log("   Dry-run:", config.defaults.dryRun);
    } else {
      console.log("⚠️  Config: lumira.config.json not found");
      console.log("   Run `lumira init` to create one.");
    }
    console.log("Next: add a provider plugin, e.g. @lumira/plugin-bags");
  });

program
  .command("health")
  .description("Run provider health check")
  .requiredOption("--provider <pkg>", "Provider package name (e.g. @lumira/plugin-bags)")
  .option("--rpc <url>", "RPC URL", "https://api.mainnet-beta.solana.com")
  .action(async (opts) => {
    const ctx: LumiraContext = {
      network: "solana-mainnet",
      rpcUrl: opts.rpc,
      dryRun: true,
      log: (m) => console.log(m)
    };
    const res = await runHealth(ctx, opts.provider);
    console.log(res);
  });

program.parseAsync(process.argv);
