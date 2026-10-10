import { describe, expect, it } from "vitest";

import type { ProxyConfig } from "../types.js";

const BASE_CONFIG: ProxyConfig = {
  port: 3100,
  upstream: "local",
  upstreamLocal: "http://127.0.0.1:3000",
  upstreamTest: "https://test.example.invalid",
  upstreamBaseUrl: "http://127.0.0.1:3000",
  timeoutMs: 10_000,
  logLevel: "info",
};

describe("resolveUpstreamBaseUrl", () => {
  it("returns the local upstream base url when upstream is local", async () => {
    const { resolveUpstreamBaseUrl } = await import("./upstream.js");

    expect(resolveUpstreamBaseUrl(BASE_CONFIG)).toBe("http://127.0.0.1:3000");
  });

  it("returns the test upstream base url when upstream is test", async () => {
    const { resolveUpstreamBaseUrl } = await import("./upstream.js");

    expect(
      resolveUpstreamBaseUrl({
        ...BASE_CONFIG,
        upstream: "test",
        upstreamBaseUrl: "https://test.example.invalid",
      }),
    ).toBe("https://test.example.invalid");
  });
});

describe("buildUpstreamUrl", () => {
  it("strips the local proxy api prefix and preserves the business path and query", async () => {
    const { buildUpstreamUrl } = await import("./upstream.js");

    expect(
      buildUpstreamUrl(
        {
          ...BASE_CONFIG,
          upstream: "test",
          upstreamBaseUrl: "https://test.example.invalid",
        },
        "http://proxy.test/proxy/api/api/orders?status=open&limit=10",
      ).toString(),
    ).toBe("https://test.example.invalid/api/orders?status=open&limit=10");
  });

  it("keeps the upstream root stable when the request is exactly /proxy/api", async () => {
    const { buildUpstreamUrl } = await import("./upstream.js");

    expect(
      buildUpstreamUrl(BASE_CONFIG, "http://proxy.test/proxy/api").toString(),
    ).toBe("http://127.0.0.1:3000/");
  });

  it("keeps the upstream root stable when the request is exactly /proxy/api/", async () => {
    const { buildUpstreamUrl } = await import("./upstream.js");

    expect(
      buildUpstreamUrl(BASE_CONFIG, "http://proxy.test/proxy/api/?foo=bar").toString(),
    ).toBe("http://127.0.0.1:3000/?foo=bar");
  });
});
