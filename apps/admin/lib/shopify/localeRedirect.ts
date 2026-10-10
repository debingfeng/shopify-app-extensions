import { isLocale, routing } from "@/lib/i18n/routing";

export function rewriteLocaleRedirect(location: string, requestUrl: URL) {
  const localeParam = requestUrl.searchParams.get("locale");
  if (!localeParam || !isLocale(localeParam)) {
    return null;
  }
  if (localeParam === routing.defaultLocale) {
    return null;
  }

  const targetUrl = new URL(location, requestUrl.origin);
  if (targetUrl.origin !== requestUrl.origin) {
    return null;
  }

  const defaultPrefix = `/${routing.defaultLocale}`;
  if (!targetUrl.pathname.startsWith(defaultPrefix)) {
    return null;
  }

  targetUrl.pathname = `/${localeParam}${targetUrl.pathname.slice(
    defaultPrefix.length,
  )}`;
  return targetUrl.toString();
}

export function maybeRewriteRedirect(response: Response, requestUrl: URL) {
  if (response.status < 300 || response.status >= 400) {
    return null;
  }

  const location = response.headers.get("location");
  if (!location) {
    return null;
  }

  const rewritten = rewriteLocaleRedirect(location, requestUrl);
  if (!rewritten) {
    return null;
  }

  const headers = new Headers(response.headers);
  headers.set("location", rewritten);

  return new Response(null, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
