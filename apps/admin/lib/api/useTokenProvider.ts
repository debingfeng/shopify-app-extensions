"use client";

import { useCallback } from "react";
import { useShopifyAppBridge } from "@/lib/shopify/appBridgeContext";

/**
 * TokenProvider 类型：一个异步函数，返回当前的 Shopify Session Token。
 *
 * 供需要在请求头中携带 Bearer Token 的 API 函数使用：
 * ```ts
 * async function fetchSomething(params: Params, getToken: TokenProvider) {
 *   const token = await getToken();
 *   const response = await fetch(url, {
 *     headers: { Authorization: `Bearer ${token}` },
 *   });
 * }
 * ```
 */
export type TokenProvider = () => Promise<string>;

/**
 * 在组件内获取一个稳定的 token 提供者回调。
 *
 * 用法示例：
 * ```ts
 * const getToken = useTokenProvider();
 *
 * useEffect(() => {
 *   fetchSomething(params, getToken);
 * }, [getToken]);
 * ```
 */
export function useTokenProvider(): TokenProvider {
  const shopify = useShopifyAppBridge();
  return useCallback(() => shopify.idToken(), [shopify]);
}
