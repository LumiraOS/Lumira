export type Network = "solana-mainnet" | "solana-devnet";
export type Permission = "read" | "sign" | "send";
export type Feature = "rewards" | "launch" | "swap";
export type PluginManifest = {
    name: string;
    version: string;
    permissions: Permission[];
    networks: Network[];
    features: Feature[];
};
export type HealthReport = {
    ok: boolean;
    details?: Record<string, unknown>;
};
export type RewardsStatusInput = {
    walletAddress?: string;
};
export type RewardsStatus = {
    items: Array<{
        label: string;
        amount?: string;
        meta?: Record<string, unknown>;
    }>;
};
export type RewardsClaimInput = {
    walletAddress?: string;
    dryRun?: boolean;
};
export type RewardsClaimResult = {
    dryRun: boolean;
    sent: boolean;
    signatures?: string[];
    summary?: string;
};
export type LumiraContext = {
    network: Network;
    rpcUrl: string;
    dryRun: boolean;
    log: (msg: string) => void;
};
export interface Provider {
    manifest: PluginManifest;
    health(ctx: LumiraContext): Promise<HealthReport>;
    rewards: {
        status(ctx: LumiraContext, input: RewardsStatusInput): Promise<RewardsStatus>;
        claim(ctx: LumiraContext, input: RewardsClaimInput): Promise<RewardsClaimResult>;
    };
}
export type CreateProvider = () => Provider;
//# sourceMappingURL=index.d.ts.map