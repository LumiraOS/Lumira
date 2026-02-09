import { Connection, PublicKey, LAMPORTS_PER_SOL, } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, createCloseAccountInstruction, } from "@solana/spl-token";
// Pump.fun program ID (mainnet)
const PUMP_PROGRAM_ID = new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P");
function lamportsToSol(lamports) {
    return (lamports / LAMPORTS_PER_SOL).toFixed(4);
}
const provider = {
    manifest: {
        name: "@lumira/plugin-pump",
        version: "0.0.0",
        permissions: ["read", "sign", "send"],
        networks: ["solana-mainnet"],
        features: ["rewards"],
    },
    async health(ctx) {
        ctx.log("[pump] Checking RPC connection...");
        try {
            const connection = new Connection(ctx.rpcUrl, "confirmed");
            const version = await connection.getVersion();
            ctx.log(`[pump] Connected — Solana ${version["solana-core"]}`);
            // Verify Pump program exists on-chain
            const programInfo = await connection.getAccountInfo(PUMP_PROGRAM_ID);
            const programFound = programInfo !== null;
            ctx.log(`[pump] Pump program: ${programFound ? "found" : "not found"}`);
            return {
                ok: programFound,
                details: {
                    provider: "pump",
                    solanaCore: version["solana-core"],
                    pumpProgram: PUMP_PROGRAM_ID.toBase58(),
                    programFound,
                },
            };
        }
        catch (e) {
            return { ok: false, details: { provider: "pump", error: e?.message ?? String(e) } };
        }
    },
    rewards: {
        async status(ctx, input) {
            ctx.log("[pump] Checking creator fee accounts...");
            if (!input.walletAddress) {
                return {
                    items: [{ label: "No wallet address provided", meta: { hint: "Pass --wallet <address> to check creator fees" } }],
                };
            }
            try {
                const connection = new Connection(ctx.rpcUrl, "confirmed");
                const wallet = new PublicKey(input.walletAddress);
                // Fetch token accounts owned by the wallet
                const tokenAccounts = await connection.getParsedTokenAccountsByOwner(wallet, {
                    programId: TOKEN_PROGRAM_ID,
                });
                // Find accounts with zero token balance but rent-reclaimable SOL
                // These are often leftover from pump.fun token launches
                const reclaimable = tokenAccounts.value.filter((account) => {
                    const parsed = account.account.data.parsed?.info;
                    const tokenAmount = parsed?.tokenAmount;
                    return tokenAmount && Number(tokenAmount.amount) === 0 && account.account.lamports > 0;
                });
                ctx.log(`[pump] Found ${tokenAccounts.value.length} token account(s), ${reclaimable.length} reclaimable`);
                if (reclaimable.length === 0) {
                    return {
                        items: [{ label: "No reclaimable creator fee accounts found", meta: { wallet: input.walletAddress, totalTokenAccounts: tokenAccounts.value.length } }],
                    };
                }
                const totalReclaimable = reclaimable.reduce((sum, a) => sum + a.account.lamports, 0);
                const items = reclaimable.map((account, i) => {
                    const parsed = account.account.data.parsed?.info;
                    return {
                        label: `Empty token account #${i + 1}`,
                        amount: `${lamportsToSol(account.account.lamports)} SOL (rent)`,
                        meta: {
                            pubkey: account.pubkey.toBase58(),
                            mint: parsed?.mint,
                            lamports: account.account.lamports,
                        },
                    };
                });
                items.unshift({
                    label: "Total reclaimable",
                    amount: `${lamportsToSol(totalReclaimable)} SOL`,
                    meta: { accountCount: reclaimable.length },
                });
                return { items };
            }
            catch (e) {
                ctx.log(`[pump] Error: ${e?.message ?? String(e)}`);
                return {
                    items: [{ label: "Error fetching creator fees", meta: { error: e?.message ?? String(e) } }],
                };
            }
        },
        async claim(ctx, input) {
            const dryRun = input.dryRun ?? ctx.dryRun;
            ctx.log("[pump] Step 1/3 — Scanning for reclaimable accounts...");
            if (!input.walletAddress) {
                ctx.log("[pump] No wallet address provided. Cannot claim.");
                return {
                    dryRun,
                    sent: false,
                    summary: "No wallet address provided. Pass --wallet <address> to claim.",
                };
            }
            try {
                const connection = new Connection(ctx.rpcUrl, "confirmed");
                const wallet = new PublicKey(input.walletAddress);
                const tokenAccounts = await connection.getParsedTokenAccountsByOwner(wallet, {
                    programId: TOKEN_PROGRAM_ID,
                });
                const reclaimable = tokenAccounts.value.filter((account) => {
                    const parsed = account.account.data.parsed?.info;
                    const tokenAmount = parsed?.tokenAmount;
                    return tokenAmount && Number(tokenAmount.amount) === 0 && account.account.lamports > 0;
                });
                if (reclaimable.length === 0) {
                    ctx.log("[pump] No reclaimable accounts found. Nothing to claim.");
                    return { dryRun, sent: false, summary: "No reclaimable accounts found." };
                }
                const totalReclaimable = reclaimable.reduce((sum, a) => sum + a.account.lamports, 0);
                ctx.log(`[pump] Found ${reclaimable.length} account(s), total ${lamportsToSol(totalReclaimable)} SOL reclaimable`);
                ctx.log("[pump] Step 2/3 — Building close-account instructions...");
                // Build close-account instructions to reclaim rent
                const closeInstructions = reclaimable.map((account) => createCloseAccountInstruction(account.pubkey, // account to close
                wallet, // destination (receive rent)
                wallet));
                ctx.log(`[pump] Built ${closeInstructions.length} close instruction(s)`);
                if (dryRun) {
                    ctx.log("[pump] Step 3/3 — Dry-run: skipping transaction send.");
                    return {
                        dryRun: true,
                        sent: false,
                        summary: `Dry-run: would close ${reclaimable.length} empty token account(s) and reclaim ${lamportsToSol(totalReclaimable)} SOL`,
                    };
                }
                ctx.log("[pump] Step 3/3 — Sending transaction...");
                ctx.log("[pump] Wallet signing not yet implemented. Transaction not sent.");
                return {
                    dryRun: false,
                    sent: false,
                    summary: `Ready to close ${reclaimable.length} account(s) and reclaim ${lamportsToSol(totalReclaimable)} SOL. Wallet signing required (not yet implemented).`,
                };
            }
            catch (e) {
                ctx.log(`[pump] Error: ${e?.message ?? String(e)}`);
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