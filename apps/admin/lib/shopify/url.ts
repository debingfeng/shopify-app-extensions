type HostShop = {
  host?: string;
  shop?: string;
};

/**
 * Shopify URL / Host 工具：
 * - 从 `host` 参数（base64url 编码）解码出 shop 域名
 * - 读取当前页面 URL 上的 `host` / `shop`
 * - 在跳转时保留 `host`/`shop` 查询参数
 */
export function getShopFromHost(host?: string): string | undefined {
  if (!host) return undefined;
  if (typeof window === "undefined" || typeof atob !== "function") return undefined;

  const normalized = host.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");

  try {
    const decoded = atob(padded);
    const match = decoded.match(/admin\.shopify\.com\/store\/([^/]+)/i);
    if (match?.[1]) return `${match[1]}.myshopify.com`;
  } catch {
    return undefined;
  }

  return undefined;
}

export function getHostShopFromLocation(
  location: Location | undefined = typeof window !== "undefined"
    ? window.location
    : undefined
): HostShop {
  if (!location) return {};
  const params = new URLSearchParams(location.search);
  const host = params.get("host") ?? undefined;
  const shop = params.get("shop") ?? getShopFromHost(host);
  return { host, shop };
}

export function preserveHostShop(path: string, location?: Location) {
  if (typeof window === "undefined") return path;
  const { host, shop } = getHostShopFromLocation(location ?? window.location);
  const url = new URL(path, window.location.origin);

  if (host && !url.searchParams.get("host")) {
    url.searchParams.set("host", host);
  }
  if (shop && !url.searchParams.get("shop")) {
    url.searchParams.set("shop", shop);
  }

  return url.pathname + url.search + url.hash;
}
