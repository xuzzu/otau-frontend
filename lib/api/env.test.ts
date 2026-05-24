import { describe, expect, test } from "vitest";
import { BASES, resolveCatalogAsset, resolveGenerationAsset } from "./env";

describe("BASES", () => {
  test("falls back to localhost ports when env not set", () => {
    expect(BASES.core).toMatch(/^http:\/\/.*8001$/);
    expect(BASES.catalog).toMatch(/^http:\/\/.*8002$/);
    expect(BASES.generation).toMatch(/^http:\/\/.*8003$/);
  });

  test("each base has no trailing slash", () => {
    for (const v of Object.values(BASES)) {
      expect(v.endsWith("/")).toBe(false);
    }
  });
});

describe("resolveCatalogAsset", () => {
  test("returns null for null/undefined/empty", () => {
    expect(resolveCatalogAsset(null)).toBeNull();
    expect(resolveCatalogAsset(undefined)).toBeNull();
    expect(resolveCatalogAsset("")).toBeNull();
  });

  test("returns absolute http(s) URLs unchanged", () => {
    expect(resolveCatalogAsset("https://images.unsplash.com/x.jpg")).toBe(
      "https://images.unsplash.com/x.jpg",
    );
    expect(resolveCatalogAsset("http://example.com/y.png")).toBe(
      "http://example.com/y.png",
    );
  });

  test("prepends catalog base for relative paths starting with /", () => {
    expect(resolveCatalogAsset("/dataset/x.png")).toBe(
      `${BASES.catalog}/dataset/x.png`,
    );
  });

  test("normalizes missing leading slash", () => {
    expect(resolveCatalogAsset("dataset/x.png")).toBe(
      `${BASES.catalog}/dataset/x.png`,
    );
  });
});

describe("resolveGenerationAsset", () => {
  test("prepends generation base for relative paths", () => {
    expect(resolveGenerationAsset("/storage/scenes/g/r/scene.png")).toBe(
      `${BASES.generation}/storage/scenes/g/r/scene.png`,
    );
  });

  test("returns absolute URLs unchanged", () => {
    expect(resolveGenerationAsset("https://cdn.example/x.png")).toBe(
      "https://cdn.example/x.png",
    );
  });

  test("returns null for null/empty", () => {
    expect(resolveGenerationAsset(null)).toBeNull();
    expect(resolveGenerationAsset("")).toBeNull();
  });
});
