import { handleApiProxyRequest } from "./handlers/api-proxy.js";
import { handleHealthRequest } from "./handlers/health.js";
import { handleShopifyCallbackRequest } from "./handlers/shopify-callback.js";
import { handleShopifyEntryRequest } from "./handlers/shopify-entry.js";
import {
  forwardProxyRequest,
  type ForwardProxyRequestOptions,
} from "./proxy/forward.js";
import type { ProxyConfig } from "./types.js";

type ForwardProxyRequestFn = (
  options: ForwardProxyRequestOptions,
) => Promise<Response>;

export interface HandleRouteOptions {
  config: ProxyConfig;
  forwardProxyRequest?: ForwardProxyRequestFn;
}

export async function handleRoute(
  request: Request,
  { config, forwardProxyRequest: forward = forwardProxyRequest }: HandleRouteOptions,
) {
  const { pathname } = new URL(request.url);

  if (request.method === "GET" && pathname === "/health") {
    return handleHealthRequest();
  }

  if (matchesBasePath(pathname, "/proxy/api")) {
    return handleApiProxyRequest(request, {
      config,
      forwardProxyRequest: forward,
    });
  }

  if (matchesBasePath(pathname, "/proxy/shopify/entry")) {
    return handleShopifyEntryRequest();
  }

  if (matchesBasePath(pathname, "/proxy/shopify/callback")) {
    return handleShopifyCallbackRequest();
  }

  return new Response(
    JSON.stringify({
      ok: false,
      service: "local-proxy",
      error: "not found",
    }),
    {
      status: 404,
      headers: {
        "content-type": "application/json; charset=utf-8",
      },
    },
  );
}

function matchesBasePath(pathname: string, basePath: string) {
  return pathname === basePath || pathname.startsWith(`${basePath}/`);
}
