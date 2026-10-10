"use client";

import type { ShopifyGlobal } from "@/lib/shopify/appBridgeContext";

export async function getAppSessionToken(shopify: ShopifyGlobal) {
  return shopify.idToken();
}
