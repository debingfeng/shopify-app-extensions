import type { ProxyConfig } from "../types.js";

const API_PROXY_BASE_PATH = "/proxy/api";

export function resolveUpstreamBaseUrl(config: ProxyConfig) {
  return config.upstreamBaseUrl;
}

export function buildUpstreamUrl(config: ProxyConfig, requestUrl: string) {
  const incomingUrl = new URL(requestUrl);
  const upstreamPath = rewriteApiProxyPath(incomingUrl.pathname);
  return new URL(
    `${upstreamPath}${incomingUrl.search}`,
    ensureTrailingSlash(resolveUpstreamBaseUrl(config)),
  );
}

function ensureTrailingSlash(value: string) {
  return value.endsWith("/") ? value : `${value}/`;
}

function rewriteApiProxyPath(pathname: string) {
  if (pathname === API_PROXY_BASE_PATH || pathname === `${API_PROXY_BASE_PATH}/`) {
    return "/";
  }

  return pathname.slice(API_PROXY_BASE_PATH.length);
}
