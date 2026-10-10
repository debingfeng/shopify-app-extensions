import { describe, expect, it } from "vitest";

import {
  createFetchRequestFromApi,
  getAbsoluteApiRequestUrl,
} from "./pagesRoute";

describe("pages route helpers", () => {
  it("builds an absolute request URL from forwarded headers", () => {
    expect(
      getAbsoluteApiRequestUrl({
        url: "/api/v2/shopify/entry/demo-app?hmac=1",
        headers: {
          host: "local.example.com",
          "x-forwarded-host": "proxy.example.com",
          "x-forwarded-proto": "https",
        },
      }),
    ).toBe("https://proxy.example.com/api/v2/shopify/entry/demo-app?hmac=1");
  });

  it("creates a fetch Request preserving method and headers", () => {
    const request = createFetchRequestFromApi({
      method: "GET",
      url: "/api/v2/shopify/callback/demo-app?hmac=1",
      headers: {
        host: "frontend.example.com",
        cookie: "session=abc",
      },
    });

    expect(request.method).toBe("GET");
    expect(request.headers.get("cookie")).toBe("session=abc");
    expect(request.url).toBe(
      "http://frontend.example.com/api/v2/shopify/callback/demo-app?hmac=1",
    );
  });
});
