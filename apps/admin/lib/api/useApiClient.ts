"use client";

import { useMemo } from "react";
import { useShopifyAppBridge } from "@/lib/shopify/appBridgeContext";
import { createApiClient } from "@/lib/api/client";

/**
 * 在组件内获取一个绑定当前 Shopify 上下文的 API 客户端。
 *
 * 客户端会自动处理：
 * - 401 / 403 → 弹 toast 并触发重新授权
 * - 429      → 弹限流提示，按概率上报
 * - 5xx      → 弹服务器错误提示，上报
 * - 网络错误  → 弹提示，按概率上报
 *
 * 用法示例：
 * ```ts
 * const apiFetch = useApiClient();
 *
 * // GET 请求
 * const data = await apiFetch<MyResponse>("/api/v1/some-endpoint");
 *
 * // POST 请求（带 Session Token）
 * import { useTokenProvider } from "@/lib/api/useTokenProvider";
 * const getToken = useTokenProvider();
 * const token = await getToken();
 * const data = await apiFetch<MyResponse>("/api/v1/some-endpoint", {
 *   method: "POST",
 *   body: JSON.stringify(payload),
 *   headers: { Authorization: `Bearer ${token}` },
 * });
 * ```
 */
export function useApiClient() {
  const shopify = useShopifyAppBridge();
  return useMemo(() => createApiClient(shopify), [shopify]);
}
