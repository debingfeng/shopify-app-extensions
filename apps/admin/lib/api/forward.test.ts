import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/config/server-config", () => ({
  getServerAppConfig: () => ({
    SHOPIFY_API_KEY: "",
    BACKEND_API_BASE: process.env.BACKEND_API_BASE ?? "",
    PLATFORM_API_BASE: process.env.PLATFORM_API_BASE ?? "",
    APP_NAME: process.env.APP_NAME ?? "",
    APP_ORIGINS: "",
  }),
}));

import { forwardShopifyRequest } from "./forward";

describe("forwardShopifyRequest", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    delete process.env.BACKEND_API_BASE;
    delete process.env.PLATFORM_API_BASE;
    delete process.env.APP_NAME;
  });

  it("uses PLATFORM_API_BASE when building the forward URL", async () => {
    process.env.BACKEND_API_BASE = "https://backend.example.com";
    process.env.PLATFORM_API_BASE = "https://platform.example.com";
    process.env.APP_NAME = "fallback-app";

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    vi.stubGlobal("fetch", fetchMock);

    const request = new Request(
      "https://frontend.example.com/api/v2/shopify/entry/demo-app?hmac=1&shop=test-shop.myshopify.com&timestamp=2",
      {
        headers: {
          host: "frontend.example.com",
          cookie: "session=abc",
        },
      },
    );

    await forwardShopifyRequest(request, {
      type: "entry",
      appName: "demo-app",
      redirect: "manual",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "https://platform.example.com/api/v2/shopify/entry/demo-app?hmac=1&shop=test-shop.myshopify.com&timestamp=2",
    );

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const headers = new Headers(init.headers);
    expect(headers.get("host")).toBeNull();
    expect(headers.get("cookie")).toBe("session=abc");
  });

  it("does not fall back to BACKEND_API_BASE when PLATFORM_API_BASE is missing", async () => {
    process.env.BACKEND_API_BASE = "https://backend.example.com";
    process.env.APP_NAME = "fallback-app";

    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const request = new Request(
      "https://frontend.example.com/api/v2/shopify/entry/demo-app?hmac=1&shop=test-shop.myshopify.com&timestamp=2",
    );

    await expect(
      forwardShopifyRequest(request, {
        type: "entry",
        appName: "demo-app",
      }),
    ).rejects.toThrow(
      "Missing PLATFORM_API_BASE configuration for Shopify forwarding.",
    );

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
