const provider = {
    manifest: {
        name: "@lumira/plugin-example",
        version: "0.0.0",
        permissions: ["read"],
        networks: ["solana-mainnet", "solana-devnet"],
        features: ["rewards"],
    },
    async health(_ctx) {
        return { ok: true, details: { provider: "example" } };
    },
    rewards: {
        async status(_ctx, _input) {
            return {
                items: [
                    { label: "Staking rewards", amount: "1.25 SOL", meta: { epoch: 600 } },
                    { label: "Airdrop allocation", amount: "500 EXAMPLE", meta: { claimable: true } },
                ],
            };
        },
        async claim(ctx, input) {
            const dryRun = input.dryRun ?? ctx.dryRun;
            if (dryRun) {
                ctx.log("[dry-run] Would claim rewards — no transaction sent.");
                return { dryRun: true, sent: false, summary: "Dry-run: 1.25 SOL + 500 EXAMPLE" };
            }
            ctx.log("Claiming rewards (example — no real tx).");
            return {
                dryRun: false,
                sent: true,
                signatures: ["ExAmPlEsIgNaTuRe111111111111111111111111111111"],
                summary: "Claimed 1.25 SOL + 500 EXAMPLE (fake)",
            };
        },
    },
};
export const createProvider = () => provider;
//# sourceMappingURL=index.js.map