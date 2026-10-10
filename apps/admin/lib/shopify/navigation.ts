"use client";

import { useCallback } from "react";
import type { NextRouter } from "next/router";

import { useShopifyHost } from "@/lib/shopify/hostContext";

function isAbsoluteUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

export function withHostSearch(pathOrUrl: string, host: string) {
  if (!pathOrUrl) return pathOrUrl;
  if (!host) return pathOrUrl;

  if (isAbsoluteUrl(pathOrUrl)) {
    const url = new URL(pathOrUrl);
    if (!url.searchParams.get("host")) url.searchParams.set("host", host);
    return url.toString();
  }

  const base =
    typeof window !== "undefined" ? window.location.origin : "http://localhost";
  const url = new URL(pathOrUrl, base);
  if (!url.searchParams.get("host")) url.searchParams.set("host", host);
  return url.pathname + url.search + url.hash;
}

export function navigateWithHost(
  router: Pick<NextRouter, "push" | "replace">,
  to: string,
  host: string,
  options?: { replace?: boolean },
) {
  const href = withHostSearch(to, host);
  if (options?.replace) {
    router.replace(href);
  } else {
    router.push(href);
  }
}

export function useNavigateWithHost() {
  const host = useShopifyHost();
  return useCallback(
    (
      router: Pick<NextRouter, "push" | "replace">,
      to: string,
      options?: { replace?: boolean },
    ) =>
      navigateWithHost(router, to, host, options),
    [host],
  );
}
