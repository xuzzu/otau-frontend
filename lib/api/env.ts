const stripTrail = (v: string) => v.replace(/\/$/, "");

export const BASES = {
  core: stripTrail(
    process.env.NEXT_PUBLIC_CORE_BASE ?? "http://localhost:8001",
  ),
  catalog: stripTrail(
    process.env.NEXT_PUBLIC_CATALOG_BASE ?? "http://localhost:8002",
  ),
  generation: stripTrail(
    process.env.NEXT_PUBLIC_GENERATION_BASE ?? "http://localhost:8003",
  ),
} as const;

function prefix(base: string, path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}

export const resolveCatalogAsset = (
  path: string | null | undefined,
): string | null => prefix(BASES.catalog, path);

export const resolveGenerationAsset = (
  path: string | null | undefined,
): string | null => prefix(BASES.generation, path);
