import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

import { routing } from "@/lib/i18n/routing";
import { shouldBypassI18nProxy } from "@/lib/i18n/proxyMatcher";

const intlMiddleware = createMiddleware({
  locales: routing.locales,
  defaultLocale: routing.defaultLocale,
  localePrefix: "always",
  localeDetection: false,
});

export default function proxy(request: NextRequest) {
  if (shouldBypassI18nProxy(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|shopify|dev-proxy|_next|.*\\..*).*)"],
};
