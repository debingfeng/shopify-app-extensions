import { describe, expect, it } from "vitest";

import {
  buildDefaultLocaleRedirect,
  resolveLocaleValue,
} from "./pages";

describe("pages router i18n helpers", () => {
  it("falls back to the default locale when the route param is invalid", () => {
    expect(resolveLocaleValue("fr")).toBe("en");
    expect(resolveLocaleValue(["zh-CN"])).toBe("zh-CN");
    expect(resolveLocaleValue(undefined)).toBe("en");
  });

  it("builds the default-locale redirect and preserves query params", () => {
    expect(
      buildDefaultLocaleRedirect({
        host: "encoded-host",
        shop: "test-shop.myshopify.com",
        ids: ["1", "2"],
      }),
    ).toBe(
      "/en?host=encoded-host&shop=test-shop.myshopify.com&ids=1&ids=2",
    );
  });
});
