import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  i18nProxyMatcher,
  shouldBypassI18nProxy,
} from "@/lib/i18n/proxyMatcher";

describe("i18n proxy matcher", () => {
  it("skips dev-proxy paths so local proxy rewrites can run first", () => {
    expect(i18nProxyMatcher).toBe(
      "/((?!api|shopify|dev-proxy|_next|.*\\..*).*)",
    );
  });

  it("bypasses locale handling for dev-proxy requests", () => {
    expect(shouldBypassI18nProxy("/dev-proxy")).toBe(true);
    expect(shouldBypassI18nProxy("/dev-proxy/proxy/api/orders")).toBe(true);
    expect(shouldBypassI18nProxy("/en/settings")).toBe(false);
  });

  it("keeps the Next.js proxy matcher statically analyzable", () => {
    const proxySource = readFileSync(resolve(__dirname, "proxy.ts"), "utf-8");

    expect(proxySource).toContain(
      'matcher: ["/((?!api|shopify|dev-proxy|_next|.*\\\\..*).*)"]',
    );
  });
});
