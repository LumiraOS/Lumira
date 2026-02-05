#!/usr/bin/env node
import { Command } from "commander";
import { runHealth, createRunLogger } from "@lumira/core";
import * as fs from "node:fs";
import * as path from "node:path";
const CONFIG_FILE = "lumira.config.json";
function getConfigPath(customPath) {
    if (customPath) {
        return path.isAbsolute(customPath) ? customPath : path.join(process.cwd(), customPath);
    }
    return path.join(process.cwd(), CONFIG_FILE);
}
function loadConfig(customPath) {
    const configPath = getConfigPath(customPath);
    if (!fs.existsSync(configPath)) {
        return null;
    }
    const raw = fs.readFileSync(configPath, "utf-8");
    return JSON.parse(raw);
}
function resolveConfig(opts) {
    const config = loadConfig(opts.config);
    const defaults = {
        network: "solana-mainnet",
        rpcUrl: "https://api.mainnet-beta.solana.com",
        dryRun: true
    };
    let rpcUrl = defaults.rpcUrl;
    let rpcSource = "default";
    let dryRun = defaults.dryRun;
    let dryRunSource = "default";
    // Apply config if present
    if (config) {
        rpcUrl = config.rpcUrl;
        rpcSource = "config";
        dryRun = config.defaults.dryRun;
        dryRunSource = "config";
    }
    // Apply CLI overrides
    if (opts.rpc) {
        rpcUrl = opts.rpc;
        rpcSource = "override";
    }
    if (opts.dryRun !== undefined) {
        dryRun = opts.dryRun;
        dryRunSource = "override";
    }
    return {
        network: config?.network ?? defaults.network,
        rpcUrl,
        dryRun,
        sources: {
            rpcUrl: rpcSource,
            dryRun: dryRunSource
        }
    };
}
const program = new Command();
program
    .name("lumira")
    .description("Lumira — plugin framework + CLI for safe onchain workflows")
    .version("0.0.0")
    .option("--config <path>", "Path to config file", "./lumira.config.json")
    .option("--rpc <url>", "RPC URL (overrides config)")
    .option("--dry-run", "Enable dry-run mode (overrides config)")
    .option("--no-dry-run", "Disable dry-run mode (overrides config)");
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
    const config = {
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
    .action(async (_, cmd) => {
    const opts = cmd.optsWithGlobals();
    const resolved = resolveConfig(opts);
    console.log("✅ Node:", process.version);
    const config = loadConfig(opts.config);
    if (config) {
        console.log(`✅ Config: ${opts.config} found`);
    }
    else {
        console.log("⚠️  Config: not found");
        console.log("   Run `lumira init` to create one.");
    }
    console.log("   Network:", resolved.network);
    console.log(`   RPC: ${resolved.rpcUrl} (${resolved.sources.rpcUrl})`);
    console.log(`   Dry-run: ${resolved.dryRun} (${resolved.sources.dryRun})`);
    console.log("Next: add a provider plugin, e.g. @lumira/plugin-bags");
});
program
    .command("health")
    .description("Run provider health check")
    .requiredOption("--provider <pkg>", "Provider package name (e.g. @lumira/plugin-bags)")
    .action(async (opts, cmd) => {
    const globalOpts = cmd.optsWithGlobals();
    const resolved = resolveConfig(globalOpts);
    const ctx = {
        network: resolved.network,
        rpcUrl: resolved.rpcUrl,
        dryRun: resolved.dryRun,
        log: (m) => console.log(m)
    };
    const logger = createRunLogger();
    const timestamp = new Date().toISOString();
    let success = false;
    let result;
    let error;
    try {
        result = await runHealth(ctx, opts.provider);
        success = true;
        console.log(result);
    }
    catch (e) {
        success = false;
        error = e?.message ?? String(e);
        throw e;
    }
    finally {
        const logPath = await logger.log({
            timestamp,
            command: "health",
            provider: opts.provider,
            dryRun: resolved.dryRun,
            result: { success, data: result, error }
        });
        if (success) {
            console.log(`📝 Log: ${logPath}`);
        }
    }
});
program.parseAsync(process.argv);
//# sourceMappingURL=index.js.map