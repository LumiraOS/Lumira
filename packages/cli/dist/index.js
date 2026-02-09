#!/usr/bin/env node
import { Command } from "commander";
import { runHealth, runRewardsStatus, runRewardsClaim, createRunLogger } from "@lumira/core";
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
    if (config) {
        rpcUrl = config.rpcUrl;
        rpcSource = "config";
        dryRun = config.defaults.dryRun;
        dryRunSource = "config";
    }
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
// --- Output formatting ---
function formatHealth(res) {
    const icon = res.ok ? "✅" : "❌";
    const lines = [`${icon} Health: ${res.ok ? "OK" : "FAILED"}`];
    if (res.details) {
        for (const [k, v] of Object.entries(res.details)) {
            lines.push(`   ${k}: ${v}`);
        }
    }
    return lines.join("\n");
}
function formatRewardsStatus(res) {
    if (res.items.length === 0)
        return "   No rewards found.";
    const lines = [];
    for (const item of res.items) {
        const amount = item.amount ? ` — ${item.amount}` : "";
        lines.push(`   ${item.label}${amount}`);
        if (item.meta) {
            for (const [k, v] of Object.entries(item.meta)) {
                lines.push(`     ${k}: ${v}`);
            }
        }
    }
    return lines.join("\n");
}
function formatClaimResult(res) {
    const lines = [];
    if (res.dryRun) {
        lines.push("🔒 Mode: dry-run (no transaction sent)");
    }
    else if (res.sent) {
        lines.push("✅ Transaction sent");
    }
    else {
        lines.push("⚠️  Transaction not sent");
    }
    if (res.summary)
        lines.push(`   ${res.summary}`);
    if (res.signatures?.length) {
        lines.push(`   Signatures:`);
        for (const sig of res.signatures) {
            lines.push(`     ${sig}`);
        }
    }
    return lines.join("\n");
}
function makeCtx(resolved) {
    return {
        network: resolved.network,
        rpcUrl: resolved.rpcUrl,
        dryRun: resolved.dryRun,
        log: (m) => console.log(m)
    };
}
// --- CLI ---
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
    console.log("   Project initialized with safe defaults.");
    console.log("");
    console.log("Next steps:");
    console.log("   lumira doctor              — verify setup");
    console.log("   lumira health --provider … — check a provider");
});
program
    .command("doctor")
    .description("Check basic setup")
    .action(async (_, cmd) => {
    const opts = cmd.optsWithGlobals();
    const resolved = resolveConfig(opts);
    console.log("Lumira Doctor");
    console.log("─────────────────────────────");
    console.log(`   Node:    ${process.version}`);
    const config = loadConfig(opts.config);
    if (config) {
        console.log(`   Config:  ✅ ${opts.config}`);
    }
    else {
        console.log("   Config:  ⚠️  not found");
        console.log("            Run \`lumira init\` to create one.");
    }
    console.log(`   Network: ${resolved.network}`);
    console.log(`   RPC:     ${resolved.rpcUrl} (${resolved.sources.rpcUrl})`);
    console.log(`   Dry-run: ${resolved.dryRun} (${resolved.sources.dryRun})`);
    console.log("─────────────────────────────");
    console.log("Next: lumira health --provider @lumira/plugin-bags");
});
program
    .command("health")
    .description("Run provider health check")
    .requiredOption("--provider <pkg>", "Provider package name (e.g. @lumira/plugin-bags)")
    .action(async (opts, cmd) => {
    const globalOpts = cmd.optsWithGlobals();
    const resolved = resolveConfig(globalOpts);
    const ctx = makeCtx(resolved);
    const logger = createRunLogger();
    const timestamp = new Date().toISOString();
    let success = false;
    let result;
    let error;
    try {
        result = await runHealth(ctx, opts.provider);
        success = true;
        console.log("");
        console.log(formatHealth(result));
    }
    catch (e) {
        success = false;
        error = e?.message ?? String(e);
        console.error(`\n❌ ${error}`);
    }
    finally {
        const logPath = await logger.log({
            timestamp,
            command: "health",
            provider: opts.provider,
            dryRun: resolved.dryRun,
            result: { success, data: result, error }
        });
        console.log(`\n📝 Log: ${logPath}`);
    }
});
const rewardsCmd = program.command("rewards").description("Rewards operations");
rewardsCmd
    .command("status")
    .description("Check rewards status")
    .requiredOption("--provider <pkg>", "Provider package name")
    .option("--wallet <address>", "Wallet address")
    .action(async (opts, cmd) => {
    const globalOpts = cmd.optsWithGlobals();
    const resolved = resolveConfig(globalOpts);
    const ctx = makeCtx(resolved);
    const logger = createRunLogger();
    const timestamp = new Date().toISOString();
    let success = false;
    let result;
    let error;
    try {
        result = await runRewardsStatus(ctx, opts.provider, { walletAddress: opts.wallet });
        success = true;
        console.log("\nRewards Status");
        console.log("─────────────────────────────");
        console.log(formatRewardsStatus(result));
        console.log("─────────────────────────────");
    }
    catch (e) {
        success = false;
        error = e?.message ?? String(e);
        console.error(`\n❌ ${error}`);
    }
    finally {
        const logPath = await logger.log({
            timestamp,
            command: "rewards.status",
            provider: opts.provider,
            dryRun: resolved.dryRun,
            input: { walletAddress: opts.wallet },
            result: { success, data: result, error }
        });
        console.log(`\n📝 Log: ${logPath}`);
    }
});
rewardsCmd
    .command("claim")
    .description("Claim rewards")
    .requiredOption("--provider <pkg>", "Provider package name")
    .option("--wallet <address>", "Wallet address")
    .action(async (opts, cmd) => {
    const globalOpts = cmd.optsWithGlobals();
    const resolved = resolveConfig(globalOpts);
    const ctx = makeCtx(resolved);
    const logger = createRunLogger();
    const timestamp = new Date().toISOString();
    let success = false;
    let result;
    let error;
    try {
        result = await runRewardsClaim(ctx, opts.provider, { walletAddress: opts.wallet, dryRun: resolved.dryRun });
        success = true;
        console.log("\nClaim Result");
        console.log("─────────────────────────────");
        console.log(formatClaimResult(result));
        console.log("─────────────────────────────");
    }
    catch (e) {
        success = false;
        error = e?.message ?? String(e);
        console.error(`\n❌ ${error}`);
    }
    finally {
        const logPath = await logger.log({
            timestamp,
            command: "rewards.claim",
            provider: opts.provider,
            dryRun: resolved.dryRun,
            input: { walletAddress: opts.wallet, dryRun: resolved.dryRun },
            result: { success, data: result, error }
        });
        console.log(`\n📝 Log: ${logPath}`);
    }
});
program.parseAsync(process.argv);
//# sourceMappingURL=index.js.map