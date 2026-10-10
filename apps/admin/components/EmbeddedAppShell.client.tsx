"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AppProvider,
  Banner,
  BlockStack,
  Box,
  Card,
  Frame,
  Layout,
  Page,
  PortalsManager,
  Text,
} from "@shopify/polaris";
import { NextIntlClientProvider } from "next-intl";
import type { AbstractIntlMessages } from "next-intl";

import { env } from "@/lib/env";
import { getPolarisI18n } from "@/lib/i18n/polaris";
import type { Locale } from "@/lib/i18n/routing";
import PolarisToastHost from "@/components/PolarisToastHost";
import { ShopifyAppBridgeProvider } from "@/lib/shopify/appBridgeContext";
import { ShopifyActionsProvider } from "@/lib/shopify/actionsContext";
import { ShopifyHostProvider } from "@/lib/shopify/hostContext";
import { getHostShopFromLocation, getShopFromHost } from "@/lib/shopify/url";

export type EmbeddedAppShellProps = {
  locale: Locale;
  messages: AbstractIntlMessages;
  children: React.ReactNode;
};

function getShopFromReferrer(referrer: string) {
  const match = referrer.match(/admin\.shopify\.com\/store\/([^/]+)/i);
  return match?.[1] ? `${match[1]}.myshopify.com` : null;
}

function resolveInitialContext() {
  if (typeof window === "undefined") {
    return {
      queryHost: null,
      host: null,
      shop: null,
    };
  }

  const { host: queryHost, shop: queryShop } = getHostShopFromLocation(window.location);
  const configHost = (window as unknown as { shopify?: { config?: { host?: string } } })
    ?.shopify?.config?.host;
  const host = queryHost ?? (typeof configHost === "string" && configHost.length > 0
    ? configHost
    : null);
  const shop =
    queryShop ??
    getShopFromHost(configHost) ??
    getShopFromReferrer(document.referrer ?? "");

  return {
    queryHost: queryHost ?? null,
    host,
    shop: shop ?? null,
  };
}

export default function EmbeddedAppShellClient({
  locale,
  messages,
  children,
}: EmbeddedAppShellProps) {
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);
  const redirectAttemptedRef = useRef(false);
  const [{ queryHost, host, shop }] = useState(resolveInitialContext);

  const handlePortalRef = useCallback((node: HTMLElement | null) => {
    setPortalContainer(node as HTMLDivElement | null);
  }, []);

  useEffect(() => {
    if (queryHost) return;

    const redirectedFlag = "missing-host-redirected";
    if (redirectAttemptedRef.current) return;
    let alreadyTried = false;
    try {
      alreadyTried = sessionStorage.getItem(redirectedFlag) === "1";
    } catch {
      alreadyTried = false;
    }
    if (alreadyTried) {
      redirectAttemptedRef.current = true;
      return;
    }

    if (shop && host) {
      redirectAttemptedRef.current = true;
      try {
        sessionStorage.setItem(redirectedFlag, "1");
      } catch {
        // Ignore storage access failures in embedded/strict environments.
      }
      const url = new URL(window.location.href);
      url.searchParams.set("host", host);
      url.searchParams.set("shop", shop);
      window.location.assign(url.toString());
      return;
    }

    if (!shop) return;

    redirectAttemptedRef.current = true;
    try {
      sessionStorage.setItem(redirectedFlag, "1");
    } catch {
      // Ignore storage access failures in embedded/strict environments.
    }
    const redirectUrl = new URL("/internal/dev/admin-redirect", env.BACKEND_API_BASE);
    redirectUrl.searchParams.set("shop", shop);
    redirectUrl.searchParams.set(
      "path",
      `${window.location.pathname}${window.location.search}${window.location.hash}`,
    );
    window.location.assign(redirectUrl.toString());
  }, [host, locale, queryHost, shop]);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <AppProvider i18n={getPolarisI18n(locale)}>
        {host ? (
          <ShopifyHostProvider host={host}>
            <ShopifyAppBridgeProvider>
              <ShopifyActionsProvider>
                <>
                  <Box id="polaris-overlays" ref={handlePortalRef} />
                  <PortalsManager container={portalContainer ?? undefined}>
                    <Frame>
                      {children}
                      <PolarisToastHost />
                    </Frame>
                  </PortalsManager>
                </>
              </ShopifyActionsProvider>
            </ShopifyAppBridgeProvider>
          </ShopifyHostProvider>
        ) : (
          <Page title="Embedded context required">
            <Layout>
              <Layout.Section>
                <Card>
                  <BlockStack gap="400">
                    <Banner tone="critical" title="Missing host param">
                      Please open the app from Shopify Admin or via the backend redirect.
                    </Banner>
                    <Text as="p" variant="bodyMd">
                      The loading skeleton has finished. This screen indicates that the
                      embedded Shopify context is missing, not that the page is still loading.
                    </Text>
                  </BlockStack>
                </Card>
              </Layout.Section>
            </Layout>
          </Page>
        )}
      </AppProvider>
    </NextIntlClientProvider>
  );
}
