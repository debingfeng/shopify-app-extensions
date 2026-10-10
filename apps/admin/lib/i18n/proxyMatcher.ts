export const i18nProxyMatcher = "/((?!api|shopify|dev-proxy|_next|.*\\..*).*)";

export function shouldBypassI18nProxy(pathname: string) {
  return pathname === "/dev-proxy" || pathname.startsWith("/dev-proxy/");
}
