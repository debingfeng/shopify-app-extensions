import { afterEach, describe, expect, it } from "vitest";

const ORIGINAL_ENV = { ...process.env };

describe("getProxyConfig", () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("reads proxy settings from environment variables", async () => {
    process.env.PROXY_PORT = "4310";
    process.env.PROXY_UPSTREAM = "test";
    process.env.PROXY_UPSTREAM_LOCAL = "http://127.0.0.1:4301";
    process.env.PROXY_UPSTREAM_TEST = "https://upstream.test.example.com";
    process.env.PROXY_TIMEOUT_MS = "2500";
    process.env.PROXY_LOG_LEVEL = "debug";

    const { getProxyConfig } = await import("./config.js");

    expect(getProxyConfig()).toMatchObject({
      port: 4310,
      upstream: "test",
      upstreamLocal: "http://127.0.0.1:4301",
      upstreamTest: "https://upstream.test.example.com",
      upstreamBaseUrl: "https://upstream.test.example.com",
      timeoutMs: 2500,
      logLevel: "debug",
    });
  });

  it("falls back to defaults when optional env values are missing", async () => {
    const { getProxyConfig } = await import("./config.js");

    expect(getProxyConfig({})).toMatchObject({
      port: 3100,
      upstream: "local",
      upstreamLocal: "http://127.0.0.1:3000",
      upstreamTest: "https://test.example.invalid",
      upstreamBaseUrl: "http://127.0.0.1:3000",
      timeoutMs: 10000,
      logLevel: "info",
    });
  });

  it("uses the Shopify CLI assigned PORT when PROXY_PORT is not set", async () => {
    const { getProxyConfig } = await import("./config.js");

    expect(
      getProxyConfig({
        PORT: "55134",
      }),
    ).toMatchObject({
      port: 55134,
    });
  });

  it("keeps explicit PROXY_PORT ahead of Shopify CLI assigned PORT", async () => {
    const { getProxyConfig } = await import("./config.js");

    expect(
      getProxyConfig({
        PROXY_PORT: "3100",
        PORT: "55134",
      }),
    ).toMatchObject({
      port: 3100,
    });
  });

  it("treats an empty PROXY_PORT as unset before reading PORT", async () => {
    const { getProxyConfig } = await import("./config.js");

    expect(
      getProxyConfig({
        PROXY_PORT: "",
        PORT: "55134",
      }),
    ).toMatchObject({
      port: 55134,
    });
  });

  it("rejects invalid numeric env values", async () => {
    const { getProxyConfig } = await import("./config.js");

    expect(() =>
      getProxyConfig({
        PROXY_PORT: "3100abc",
      }),
    ).toThrow("PROXY_PORT must be a non-negative integer");
  });

  it("rejects unsupported upstream selectors", async () => {
    const { getProxyConfig } = await import("./config.js");

    expect(() =>
      getProxyConfig({
        PROXY_UPSTREAM: "staging",
      }),
    ).toThrow("PROXY_UPSTREAM must be one of local, test");
  });
});
