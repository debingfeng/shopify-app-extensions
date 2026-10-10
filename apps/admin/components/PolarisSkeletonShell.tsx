"use client";

import { useMemo } from "react";
import {
  AppProvider,
  BlockStack,
  Card,
  Layout,
  SkeletonBodyText,
  SkeletonDisplayText,
  SkeletonPage,
} from "@shopify/polaris";
import { useRouter } from "next/router";

import { getPolarisI18n } from "@/lib/i18n/polaris";
import { isLocale, routing, type Locale } from "@/lib/i18n/routing";

function resolveLocale(pathname: string | null): Locale {
  if (!pathname) return routing.defaultLocale;
  const segment = pathname.split("/")[1] ?? "";
  return isLocale(segment) ? segment : routing.defaultLocale;
}

function resolveSkeletonVariant(pathname: string | null) {
  const section = pathname?.split("/")[2] ?? "";
  if (section === "settings") return "settings";
  if (section === "help") return "help";
  return "dashboard";
}

function renderDashboardSkeleton() {
  return (
    <>
      <Layout.Section>
        <Card>
          <BlockStack gap="400">
            <SkeletonDisplayText size="medium" />
            <SkeletonBodyText lines={2} />
          </BlockStack>
        </Card>
      </Layout.Section>
      <Layout.Section>
        <Card>
          <BlockStack gap="400">
            <SkeletonDisplayText size="small" />
            <SkeletonBodyText lines={6} />
          </BlockStack>
        </Card>
      </Layout.Section>
    </>
  );
}

function renderSettingsSkeleton() {
  return (
    <>
      <Layout.Section>
        <Card>
          <BlockStack gap="400">
            <SkeletonDisplayText size="medium" />
            <SkeletonBodyText lines={4} />
          </BlockStack>
        </Card>
      </Layout.Section>
      <Layout.Section>
        <Card>
          <BlockStack gap="400">
            <SkeletonDisplayText size="small" />
            <SkeletonBodyText lines={3} />
          </BlockStack>
        </Card>
      </Layout.Section>
    </>
  );
}

function renderHelpSkeleton() {
  return (
    <Layout.Section>
      <Card>
        <BlockStack gap="400">
          <SkeletonDisplayText size="medium" />
          <SkeletonBodyText lines={8} />
        </BlockStack>
      </Card>
    </Layout.Section>
  );
}

export default function PolarisSkeletonShell() {
  const router = useRouter();
  const pathname = useMemo(() => {
    if (typeof router.asPath === "string" && router.asPath.length > 0) {
      return router.asPath.split("?")[0] ?? router.asPath;
    }
    return router.pathname;
  }, [router.asPath, router.pathname]);
  const locale = useMemo(() => resolveLocale(pathname), [pathname]);
  const variant = useMemo(() => resolveSkeletonVariant(pathname), [pathname]);

  return (
    <AppProvider i18n={getPolarisI18n(locale)}>
      <SkeletonPage>
        <Layout>
          {variant === "settings"
            ? renderSettingsSkeleton()
            : variant === "help"
              ? renderHelpSkeleton()
              : renderDashboardSkeleton()}
        </Layout>
      </SkeletonPage>
    </AppProvider>
  );
}
