import { Connection, PublicKey, StakeProgram, LAMPORTS_PER_SOL, } from "@solana/web3.js";
function lamportsToSol(lamports) {
    return (lamports / LAMPORTS_PER_SOL).toFixed(4);
}
const provider = {
    manifest: {
        name: "@lumira/plugin-bags",
        version: "0.0.0",
        permissions: ["read", "sign", "send"],
        networks: ["solana-mainnet", "solana-devnet"],
        features: ["rewards"],
    },
    async health(ctx) {
        ctx.log("[bags] Checking RPC connection...");
        try {
            const connection = new Connection(ctx.rpcUrl, "confirmed");
            const version = await connection.getVersion();
            ctx.log(`[bags] Connected — Solana ${version["solana-core"]}`);
            return { ok: true, details: { provider: "bags", solanaCore: version["solana-core"] } };
        }
        catch (e) {
            return { ok: false, details: { provider: "bags", error: e?.message ?? String(e) } };
        }
    },
    rewards: {
        async status(ctx, input) {
            ctx.log("[bags] Fetching stake accounts...");
            if (!input.walletAddress) {
                return {
                    items: [{ label: "No wallet address provided", meta: { hint: "Pass --wallet <address> to check rewards" } }],
                };
            }
            try {
                const connection = new Connection(ctx.rpcUrl, "confirmed");
                const wallet = new PublicKey(input.walletAddress);
                const stakeAccounts = await connection.getParsedProgramAccounts(StakeProgram.programId, {
                    filters: [
                        { dataSize: 200 },
                        {
                            memcmp: {
                                offset: 12,
                                bytes: wallet.toBase58(),
                            },
                        },
                    ],
                });
                ctx.log(`[bags] Found ${stakeAccounts.length} stake account(s)`);
                if (stakeAccounts.length === 0) {
                    return {
                        items: [{ label: "No stake accounts found", meta: { wallet: input.walletAddress } }],
                    };
                }
                const items = stakeAccounts.map((account, i) => {
                    const parsed = account.account.data?.parsed?.info;
                    const lamports = account.account.lamports;
                    return {
                        label: `Stake account #${i + 1}`,
                        amount: `${lamportsToSol(lamports)} SOL`,
                        meta: {
                            pubkey: account.pubkey.toBase58(),
                            lamports,
                            ...(parsed?.stake?.delegation?.voter
                                ? { voter: parsed.stake.delegation.voter }
                                : {}),
                        },
                    };
                });
                return { items };
            }
            catch (e) {
                ctx.log(`[bags] Error: ${e?.message ?? String(e)}`);
                return {
                    items: [{ label: "Error fetching rewards", meta: { error: e?.message ?? String(e) } }],
                };
            }
        },
        async claim(ctx, input) {
            const dryRun = input.dryRun ?? ctx.dryRun;
            ctx.log("[bags] Step 1/3 — Checking stake accounts...");
            if (!input.walletAddress) {
                ctx.log("[bags] No wallet address provided. Cannot claim.");
                return {
                    dryRun,
                    sent: false,
                    summary: "No wallet address provided. Pass --wallet <address> to claim.",
                };
            }
            try {
                const connection = new Connection(ctx.rpcUrl, "confirmed");
                const wallet = new PublicKey(input.walletAddress);
                const stakeAccounts = await connection.getParsedProgramAccounts(StakeProgram.programId, {
                    filters: [
                        { dataSize: 200 },
                        {
                            memcmp: {
                                offset: 12,
                                bytes: wallet.toBase58(),
                            },
                        },
                    ],
                });
                if (stakeAccounts.length === 0) {
                    ctx.log("[bags] No stake accounts found. Nothing to claim.");
                    return { dryRun, sent: false, summary: "No stake accounts found." };
                }
                const totalLamports = stakeAccounts.reduce((sum, a) => sum + a.account.lamports, 0);
                ctx.log(`[bags] Found ${stakeAccounts.length} account(s), total ${lamportsToSol(totalLamports)} SOL`);
                ctx.log("[bags] Step 2/3 — Building withdraw instructions...");
                const withdrawInstructions = stakeAccounts.map((account) => StakeProgram.withdraw({
                    stakePubkey: account.pubkey,
                    authorizedPubkey: wallet,
                    toPubkey: wallet,
                    lamports: account.account.lamports,
                }));
                ctx.log(`[bags] Built ${withdrawInstructions.length} withdraw instruction(s)`);
                if (dryRun) {
                    ctx.log("[bags] Step 3/3 — Dry-run: skipping transaction send.");
                    return {
                        dryRun: true,
                        sent: false,
                        summary: `Dry-run: would withdraw ${lamportsToSol(totalLamports)} SOL from ${stakeAccounts.length} stake account(s)`,
                    };
                }
                ctx.log("[bags] Step 3/3 — Sending transaction...");
                ctx.log("[bags] ⚠️  Wallet signing not yet implemented. Transaction not sent.");
                return {
                    dryRun: false,
                    sent: false,
                    summary: `Ready to withdraw ${lamportsToSol(totalLamports)} SOL from ${stakeAccounts.length} account(s). Wallet signing required (not yet implemented).`,
                };
            }
            catch (e) {
                ctx.log(`[bags] Error: ${e?.message ?? String(e)}`);
                return {
                    dryRun,
                    sent: false,
                    summary: `Error: ${e?.message ?? String(e)}`,
                };
            }
        },
    },
};
export const createProvider = () => provider;
//# sourceMappingURL=index.js.map