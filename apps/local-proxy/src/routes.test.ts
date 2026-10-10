import { describe, expect, it, vi } from "vitest";

import type { ProxyConfig } from "./types.js";

const BASE_CONFIG: ProxyConfig = {
  port: 3100,
  upstream: "local",
  upstreamLocal: "http://127.0.0.1:3000",
  upstreamTest: "https://test.example.invalid",
  upstreamBaseUrl: "http://127.0.0.1:3000",
  timeoutMs: 10_000,
  logLevel: "info",
};

describe("handleRoute", () => {
  it("keeps /health available", async () => {
    const { handleRoute } = await import("./routes.js");

    const response = await handleRoute(new Request("http://proxy.test/health"), {
      config: BASE_CONFIG,
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      ok: true,
      service: "local-proxy",
    });
  });

  it("requires a session token for the checkout learning mock", async () => {
    const { handleRoute } = await import("./routes.js");
    const response = await handleRoute(new Request("http://proxy.test/proxy/checkout-learning/session", {method: "POST", body: "{}"}), {config: BASE_CONFIG});
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ok: false, error: "missing session token"});
  });

  it("returns a mock response for a tokenized checkout request", async () => {
    const { handleRoute } = await import("./routes.js");
    const response = await handleRoute(new Request("http://proxy.test/proxy/checkout-learning/session", {
      method: "POST",
      headers: {authorization: "Bearer demo-session-token", "content-type": "application/json"},
      body: JSON.stringify({scenario: "backend"}),
    }), {config: BASE_CONFIG});
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ok: true, tokenReceived: true, echo: {scenario: "backend"}});
  });

  it("forwards /proxy/api/api/* requests to the selected upstream business path", async () => {
    const { handleRoute } = await import("./routes.js");
    const forwardProxyRequest = vi.fn(async () => new Response(null, { status: 204 }));

    const response = await handleRoute(
      new Request("http://proxy.test/proxy/api/api/orders?status=open", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ note: "updated" }),
      }),
      {
        config: {
          ...BASE_CONFIG,
          upstream: "test",
          upstreamBaseUrl: "https://test.example.invalid",
        },
        forwardProxyRequest,
      },
    );

    expect(response.status).toBe(204);
    expect(forwardProxyRequest).toHaveBeenCalledOnce();
    expect(forwardProxyRequest).toHaveBeenCalledWith({
      request: expect.any(Request),
      upstreamUrl: new URL("https://test.example.invalid/api/orders?status=open"),
      upstreamName: "test",
      timeoutMs: 10_000,
    });
  });

  it("treats /proxy/api as a valid proxy base path", async () => {
    const { handleRoute } = await import("./routes.js");
    const forwardProxyRequest = vi.fn(async () => new Response(null, { status: 204 }));

    const response = await handleRoute(new Request("http://proxy.test/proxy/api"), {
      config: BASE_CONFIG,
      forwardProxyRequest,
    });

    expect(response.status).toBe(204);
    expect(forwardProxyRequest).toHaveBeenCalledOnce();
  });

  it("treats /proxy/api/ as a valid proxy base path", async () => {
    const { handleRoute } = await import("./routes.js");
    const forwardProxyRequest = vi.fn(async () => new Response(null, { status: 204 }));

    const response = await handleRoute(new Request("http://proxy.test/proxy/api/"), {
      config: BASE_CONFIG,
      forwardProxyRequest,
    });

    expect(response.status).toBe(204);
    expect(forwardProxyRequest).toHaveBeenCalledOnce();
  });

  it("returns a placeholder response for /proxy/shopify/entry", async () => {
    const { handleRoute } = await import("./routes.js");

    const response = await handleRoute(new Request("http://proxy.test/proxy/shopify/entry"), {
      config: BASE_CONFIG,
    });

    expect(response.status).toBe(501);
    expect(await response.json()).toEqual({
      ok: false,
      service: "local-proxy",
      error: "v4.0 未启用",
    });
  });

  it("returns a placeholder response for /proxy/shopify/entry/*", async () => {
    const { handleRoute } = await import("./routes.js");

    const response = await handleRoute(
      new Request("http://proxy.test/proxy/shopify/entry/app"),
      {
        config: BASE_CONFIG,
      },
    );

    expect(response.status).toBe(501);
    expect(await response.json()).toEqual({
      ok: false,
      service: "local-proxy",
      error: "v4.0 未启用",
    });
  });

  it("returns a placeholder response for /proxy/shopify/callback", async () => {
    const { handleRoute } = await import("./routes.js");

    const response = await handleRoute(
      new Request("http://proxy.test/proxy/shopify/callback"),
      {
        config: BASE_CONFIG,
      },
    );

    expect(response.status).toBe(501);
    expect(await response.json()).toEqual({
      ok: false,
      service: "local-proxy",
      error: "v4.0 未启用",
    });
  });

  it("returns a placeholder response for /proxy/shopify/callback/*", async () => {
    const { handleRoute } = await import("./routes.js");

    const response = await handleRoute(
      new Request("http://proxy.test/proxy/shopify/callback/app"),
      {
        config: BASE_CONFIG,
      },
    );

    expect(response.status).toBe(501);
    expect(await response.json()).toEqual({
      ok: false,
      service: "local-proxy",
      error: "v4.0 未启用",
    });
  });

  it("keeps the 404 envelope aligned with other proxy errors", async () => {
    const { handleRoute } = await import("./routes.js");

    const response = await handleRoute(new Request("http://proxy.test/missing"), {
      config: BASE_CONFIG,
    });

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      ok: false,
      service: "local-proxy",
      error: "not found",
    });
  });
});
