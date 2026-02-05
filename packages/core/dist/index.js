export async function loadProvider(pkgName) {
    try {
        const mod = await import(pkgName);
        const createProvider = mod.createProvider;
        if (!createProvider)
            return { ok: false, error: `Package ${pkgName} does not export createProvider()` };
        const provider = createProvider();
        return { ok: true, provider };
    }
    catch (e) {
        return { ok: false, error: e?.message ?? String(e) };
    }
}
export async function runHealth(ctx, providerPkg) {
    const res = await loadProvider(providerPkg);
    if (!res.ok)
        throw new Error(res.error);
    return res.provider.health(ctx);
}
export async function runRewardsStatus(ctx, providerPkg, input) {
    const res = await loadProvider(providerPkg);
    if (!res.ok)
        throw new Error(res.error);
    return res.provider.rewards.status(ctx, input);
}
export async function runRewardsClaim(ctx, providerPkg, input) {
    const res = await loadProvider(providerPkg);
    if (!res.ok)
        throw new Error(res.error);
    return res.provider.rewards.claim(ctx, input);
}
//# sourceMappingURL=index.js.map