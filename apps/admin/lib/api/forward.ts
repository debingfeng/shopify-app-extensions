import { getServerAppConfig } from "@/config/server-config";

type ShopifyForwardType = "callback" | "entry";

type ForwardOptions = {
  type: ShopifyForwardType;
  appName?: string;
  redirect?: RequestRedirect;
};

function buildShopifyForwardUrl(type: ShopifyForwardType, appName: string) {
  const { PLATFORM_API_BASE } = getServerAppConfig();
  const platformBase = PLATFORM_API_BASE.trim();

  if (!platformBase) {
    throw new Error(
      "Missing PLATFORM_API_BASE configuration for Shopify forwarding.",
    );
  }

  const base = platformBase.replace(/\/$/, "");
  return `${base}/api/v2/shopify/${type}/${appName}`;
}

function cloneForwardHeaders(headers: Headers) {
  const next = new Headers(headers);
  next.delete("host");
  return next;
}

export async function forwardShopifyRequest(
  request: Request,
  options: ForwardOptions,
) {
  const { APP_NAME } = getServerAppConfig();
  const appName = options.appName ?? APP_NAME;
  const targetUrl = new URL(buildShopifyForwardUrl(options.type, appName));
  const incomingUrl = new URL(request.url);
  targetUrl.search = incomingUrl.search;

  console.info("[shopify-forward] target", {
    type: options.type,
    appName,
    url: targetUrl.toString(),
  });

  const init: RequestInit = {
    method: request.method,
    headers: cloneForwardHeaders(request.headers),
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  let response: Response;
  try {
    response = await fetch(targetUrl.toString(), {
      ...init,
      cache: "no-store",
      redirect: options.redirect ?? "follow",
    });
  } catch (error) {
    console.error("[shopify-forward] fetch failed", {
      type: options.type,
      appName,
      url: targetUrl.toString(),
      error,
    });
    throw error;
  }

  const headers = new Headers(response.headers);
  headers.delete("content-encoding");
  headers.delete("content-length");
  headers.delete("transfer-encoding");

  if (response.status >= 300 && response.status < 400) {
    return new Response(null, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  const buffer = await response.arrayBuffer();
  return new Response(buffer, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
