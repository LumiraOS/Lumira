import type { CreateProvider, Provider, LumiraContext } from "@lumira/plugin-types";

export type LoadProviderResult =
  | { ok: true; provider: Provider }
  | { ok: false; error: string };

export async function loadProvider(pkgName: string): Promise<LoadProviderResult> {
  try {
    const mod: any = await import(pkgName);
    const createProvider: CreateProvider | undefined = mod.createProvider;
    if (!createProvider) return { ok: false, error: `Package ${pkgName} does not export createProvider()` };
    const provider = createProvider();
    return { ok: true, provider };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? String(e) };
  }
}

export async function runHealth(ctx: LumiraContext, providerPkg: string) {
  const res = await loadProvider(providerPkg);
  if (!res.ok) throw new Error(res.error);
  return res.provider.health(ctx);
}

export async function runRewardsStatus(ctx: LumiraContext, providerPkg: string, input: any) {
  const res = await loadProvider(providerPkg);
  if (!res.ok) throw new Error(res.error);
  return res.provider.rewards.status(ctx, input);
}

export async function runRewardsClaim(ctx: LumiraContext, providerPkg: string, input: any) {
  const res = await loadProvider(providerPkg);
  if (!res.ok) throw new Error(res.error);
  return res.provider.rewards.claim(ctx, input);
}
