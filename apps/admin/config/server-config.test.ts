import { afterEach, describe, expect, it, vi } from "vitest";

const mutableEnv = process.env as Record<string, string | undefined>;

async function loadServerConfig(fileConfig: Record<string, unknown>) {
  vi.resetModules();
  vi.doMock("node:fs", () => ({
    readFileSync: vi.fn(() => JSON.stringify(fileConfig)),
  }));

  return import("./server-config");
}

describe("server config", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.doUnmock("node:fs");
    vi.resetModules();
    delete mutableEnv.NODE_ENV;
    delete process.env.BACKEND_API_BASE;
    delete process.env.NEXT_PUBLIC_BACKEND_API_BASE;
    delete process.env.PLATFORM_API_BASE;
    delete process.env.NEXT_PUBLIC_PLATFORM_API_BASE;
  });

  it("reads PLATFORM_API_BASE from config.json", async () => {
    const { getServerAppConfig, getServerConfigValue } =
      await loadServerConfig({
        PLATFORM_API_BASE: "https://platform-from-file.example.com",
      });

    expect(getServerConfigValue("PLATFORM_API_BASE")).toBe(
      "https://platform-from-file.example.com",
    );
    expect(getServerAppConfig().PLATFORM_API_BASE).toBe(
      "https://platform-from-file.example.com",
    );
  });

  it("prefers PLATFORM_API_BASE from env over config.json", async () => {
    process.env.PLATFORM_API_BASE = "https://platform-from-env.example.com";

    const { getServerConfigValue } = await loadServerConfig({
      PLATFORM_API_BASE: "https://platform-from-file.example.com",
    });

    expect(getServerConfigValue("PLATFORM_API_BASE")).toBe(
      "https://platform-from-env.example.com",
    );
  });

  it("does not expose operations-owned Shopify scopes or webhook topics", async () => {
    const { getServerAppConfig } = await loadServerConfig({
      PLATFORM_API_BASE: "https://platform-from-file.example.com",
      scopes: "read_orders",
      topics: "orders/create",
    });

    const config = getServerAppConfig();

    expect(config).not.toHaveProperty("scopes");
    expect(config).not.toHaveProperty("topics");
  });

  it("rejects dev-proxy backend base from env outside local development", async () => {
    mutableEnv.NODE_ENV = "production";
    process.env.BACKEND_API_BASE = "/dev-proxy/proxy/api";

    const { getServerAppConfig } = await loadServerConfig({
      BACKEND_API_BASE: "https://test-core.example.com",
    });

    expect(() => getServerAppConfig()).toThrow(
      "BACKEND_API_BASE must not use /dev-proxy outside local development.",
    );
  });

  it("rejects dev-proxy backend base from config.json outside local development", async () => {
    mutableEnv.NODE_ENV = "production";

    const { getServerAppConfig } = await loadServerConfig({
      BACKEND_API_BASE: "/dev-proxy/proxy/api",
    });

    expect(() => getServerAppConfig()).toThrow(
      "BACKEND_API_BASE must not use /dev-proxy outside local development.",
    );
  });
});
