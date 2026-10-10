/**
 * Host Context：
 * 把当前 Shopify Admin 的 `host` 参数放进 React Context，供需要的地方读取。
 */
"use client";

import { createContext, useContext, type PropsWithChildren } from "react";

const HostContext = createContext<string | null>(null);

export function ShopifyHostProvider({
  host,
  children,
}: PropsWithChildren<{ host: string }>) {
  return <HostContext.Provider value={host}>{children}</HostContext.Provider>;
}

export function useShopifyHost() {
  const host = useContext(HostContext);
  if (!host) {
    throw new Error(
      "Shopify host is not available. Ensure ShopifyHostProvider is mounted and URL contains `host`.",
    );
  }
  return host;
}