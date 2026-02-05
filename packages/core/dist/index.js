import * as fs from "node:fs";
import * as path from "node:path";
export function createRunLogger(baseDir = "./lumira-runs") {
    return {
        async log(entry) {
            // Ensure directory exists
            if (!fs.existsSync(baseDir)) {
                fs.mkdirSync(baseDir, { recursive: true });
            }
            // Generate filename with timestamp
            const now = new Date();
            const filename = `run-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}.json`;
            const filepath = path.join(baseDir, filename);
            // Write log file
            fs.writeFileSync(filepath, JSON.stringify(entry, null, 2) + "\n");
            return filepath;
        }
    };
}
export async function loadProvider(pkgName) {
    try {
        const mod = await import(pkgName);
        const createProvider = mod.createProvider;
        if (!createProvider) {
            return {
                ok: false,
                error: `Package '${pkgName}' does not export createProvider(). Check your plugin implementation.`
            };
        }
        const provider = createProvider();
        // Validate provider structure
        if (!provider) {
            return {
                ok: false,
                error: `createProvider() from '${pkgName}' returned null/undefined. Must return a Provider object.`
            };
        }
        if (!provider.manifest) {
            return {
                ok: false,
                error: `Provider from '${pkgName}' is missing required 'manifest' property.`
            };
        }
        // Validate manifest structure
        const m = provider.manifest;
        if (!m.name || !m.version || !m.permissions || !m.networks || !m.features) {
            return {
                ok: false,
                error: `Provider manifest from '${pkgName}' is incomplete. Required: name, version, permissions, networks, features.`
            };
        }
        // Validate provider methods
        if (typeof provider.health !== "function") {
            return {
                ok: false,
                error: `Provider from '${pkgName}' is missing required method 'health()'.`
            };
        }
        if (!provider.rewards || typeof provider.rewards.status !== "function" || typeof provider.rewards.claim !== "function") {
            return {
                ok: false,
                error: `Provider from '${pkgName}' is missing required 'rewards.status()' or 'rewards.claim()' methods.`
            };
        }
        return { ok: true, provider };
    }
    catch (e) {
        return {
            ok: false,
            error: `Failed to load '${pkgName}': ${e?.message ?? String(e)}`
        };
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