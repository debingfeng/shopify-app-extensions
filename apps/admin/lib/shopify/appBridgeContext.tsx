/**
 * App Bridge Context：
 * 从 CDN 注入的 `window.shopify` 读取 Shopify App Bridge 全局对象，
 * 并通过 React Context 提供给子组件使用。
 */
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";

export type ShopifyGlobal = {
  config: {
    apiKey?: string;
    host?: string;
    locale?: string;
    shop?: string;
  };
  idToken: () => Promise<string>;
  toast: {
    show: (
      message: string,
      opts?: { duration?: number; isError?: boolean },
    ) => void;
  };
  navigation?: {
    redirect: (url: string) => void;
  };
  redirect?: (url: string) => void;
  loading?: (state: boolean) => void;
};

const ShopifyContext = createContext<ShopifyGlobal | null>(null);

function getShopifyGlobal(): ShopifyGlobal | null {
  if (typeof window === "undefined") return null;
  const s = (window as unknown as { shopify?: ShopifyGlobal }).shopify;
  return s && typeof s.idToken === "function" ? s : null;
}

export function ShopifyAppBridgeProvider({ children }: PropsWithChildren) {
  const [shopify, setShopify] = useState<ShopifyGlobal | null>(
    getShopifyGlobal,
  );

  useEffect(() => {
    if (shopify) return;
    // The CDN script is synchronous, but guard against slow networks.
    let attempts = 0;
    const timer = setInterval(() => {
      const g = getShopifyGlobal();
      if (g) {
        setShopify(g);
        clearInterval(timer);
      }
      if (++attempts > 50) clearInterval(timer); // give up after ~5 s
    }, 100);
    return () => clearInterval(timer);
  }, [shopify]);

  return (
    <ShopifyContext.Provider value={shopify}>
      {children}
    </ShopifyContext.Provider>
  );
}

export function useShopifyAppBridge(): ShopifyGlobal {
  const shopify = useContext(ShopifyContext);
  if (!shopify) {
    throw new Error(
      "Shopify App Bridge is not available. " +
        "Ensure ShopifyAppBridgeProvider is mounted and the CDN script has loaded.",
    );
  }
  return shopify;
}
