/**
 * Actions Context：
 * 对外暴露 `showToast` / `triggerReauth` 等 App Bridge 能力的统一入口。
 * 业务层只需要调用 `useShopifyActions()` 即可。
 */
"use client";

import { createContext, useContext, useMemo, type PropsWithChildren } from "react";

import { useShopifyAppBridge } from "@/lib/shopify/appBridgeContext";
import { triggerReauth } from "@/lib/shopify/reauth";
import { showToast } from "@/lib/shopify/toast";

type ShopifyActions = {
  showToast: (message: string) => void;
  triggerReauth: () => void;
};

const ShopifyActionsContext = createContext<ShopifyActions | null>(null);

export function ShopifyActionsProvider({ children }: PropsWithChildren) {
  const shopify = useShopifyAppBridge();
  const actions = useMemo(
    () => ({
      showToast: (message: string) => {
        showToast(shopify, message);
      },
      triggerReauth: () => {
        if (shopify) triggerReauth(shopify);
      },
    }),
    [shopify],
  );

  return (
    <ShopifyActionsContext.Provider value={actions}>
      {children}
    </ShopifyActionsContext.Provider>
  );
}

export function useShopifyActions() {
  const actions = useContext(ShopifyActionsContext);
  if (!actions) {
    throw new Error(
      "ShopifyActionsProvider is not available. Ensure ShopifyActionsProvider is mounted.",
    );
  }
  return actions;
}
