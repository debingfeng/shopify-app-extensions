import { afterEach, describe, expect, it, vi } from "vitest";

const mutableEnv = process.env as Record<string, string | undefined>;

async function loadRuntimeConfig(nodeEnv: string) {
  vi.resetModules();
  mutableEnv.NODE_ENV = nodeEnv;

  return import("./runtime-config");
}

describe("runtime config", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.resetModules();
    delete mutableEnv.NODE_ENV;
    delete mutableEnv.NEXT_PUBLIC_BACKEND_API_BASE;
  });

  it("allows dev-proxy backend base in local development", async () => {
    mutableEnv.NEXT_PUBLIC_BACKEND_API_BASE = "/dev-proxy/proxy/api";
    const { runtimeConfig } = await loadRuntimeConfig("development");

    await expect(runtimeConfig.load()).resolves.toBeUndefined();

    expect(runtimeConfig.get().BACKEND_API_BASE).toBe("/dev-proxy/proxy/api");
  });

  it("rejects dev-proxy backend base from config.json outside local development", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          BACKEND_API_BASE: "/dev-proxy/proxy/api",
        }),
      })),
    );

    const { runtimeConfig } = await loadRuntimeConfig("production");

    await expect(runtimeConfig.load()).rejects.toThrow(
      "BACKEND_API_BASE must not use /dev-proxy outside local development.",
    );
  });
});
