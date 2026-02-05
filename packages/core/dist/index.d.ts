import type { Provider, LumiraContext } from "@lumira/plugin-types";
export type LoadProviderResult = {
    ok: true;
    provider: Provider;
} | {
    ok: false;
    error: string;
};
export declare function loadProvider(pkgName: string): Promise<LoadProviderResult>;
export declare function runHealth(ctx: LumiraContext, providerPkg: string): Promise<import("@lumira/plugin-types").HealthReport>;
export declare function runRewardsStatus(ctx: LumiraContext, providerPkg: string, input: any): Promise<import("@lumira/plugin-types").RewardsStatus>;
export declare function runRewardsClaim(ctx: LumiraContext, providerPkg: string, input: any): Promise<import("@lumira/plugin-types").RewardsClaimResult>;
//# sourceMappingURL=index.d.ts.map