// @vitest-environment jsdom

import { describe, expect, it } from "vitest";

import { getHostShopFromLocation, getShopFromHost, preserveHostShop } from "./url";

describe("shopify url helpers", () => {
  it("decodes shop domain from host", () => {
    expect(getShopFromHost("YWRtaW4uc2hvcGlmeS5jb20vc3RvcmUvdGVzdC1zaG9w")).toBe(
      "test-shop.myshopify.com",
    );
  });

  it("falls back to decoded host when shop query is missing", () => {
    const location = {
      origin: "https://example.com",
      search: "?host=YWRtaW4uc2hvcGlmeS5jb20vc3RvcmUvdGVzdC1zaG9w",
    } as Location;

    expect(getHostShopFromLocation(location)).toEqual({
      host: "YWRtaW4uc2hvcGlmeS5jb20vc3RvcmUvdGVzdC1zaG9w",
      shop: "test-shop.myshopify.com",
    });
  });

  it("preserves host and shop for in-app navigation", () => {
    const location = {
      origin: "https://example.com",
      search:
        "?host=YWRtaW4uc2hvcGlmeS5jb20vc3RvcmUvdGVzdC1zaG9w&shop=test-shop.myshopify.com",
    } as Location;

    expect(preserveHostShop("/en/settings", location)).toBe(
      "/en/settings?host=YWRtaW4uc2hvcGlmeS5jb20vc3RvcmUvdGVzdC1zaG9w&shop=test-shop.myshopify.com",
    );
  });
});
