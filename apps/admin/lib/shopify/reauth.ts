/**
 * 重新授权（Reauth）：
 * 根据 `shopify.navigation.redirect` 或 `shopify.redirect` 的可用能力触发重定向，
 * 并尽量保留 `host`/`shop` 查询参数。
 */
import { preserveHostShop } from "@/lib/shopify/url";
import { isNavigationCapable } from "@/lib/shopify/types";

export function triggerReauth(shopify: unknown) {
  const target = preserveHostShop("/");

  if (isNavigationCapable(shopify)) {
    if (shopify.navigation?.redirect) {
      shopify.navigation.redirect(target);
      return;
    }
    if (shopify.redirect) {
      shopify.redirect(target);
      return;
    }
  }

  if (typeof window !== "undefined") {
    window.location.assign(target);
  }
}
