"use client";

import type { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { BlockStack, Button, Card, InlineGrid, Layout, Page, Text } from "@shopify/polaris";
import { useTranslations } from "next-intl";

import { getLocalePageProps, resolveLocaleValue } from "@/lib/i18n/pages";
import { preserveHostShop } from "@/lib/shopify/url";

export const getServerSideProps: GetServerSideProps = getLocalePageProps;

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const navigation = useTranslations("Navigation");
  const router = useRouter();
  const locale = resolveLocaleValue(router.query.locale);
  const sections = [
    { slug: "packages", title: navigation("packages"), description: t("packagesDescription") },
    { slug: "extensions", title: navigation("extensions"), description: t("extensionsDescription") },
    { slug: "capabilities", title: navigation("capabilities"), description: t("capabilitiesDescription") },
  ] as const;

  return (
    <>
      <Head><title>{t("title")}</title></Head>
      <Page title={t("title")}>
        <Layout>
          <Layout.Section>
            <Text as="p" variant="bodyLg">{t("description")}</Text>
          </Layout.Section>
          <Layout.Section>
            <InlineGrid columns={{ xs: 1, md: 3 }} gap="400">
              {sections.map((section) => (
                <Card key={section.slug}>
                  <BlockStack gap="400">
                    <Text as="h2" variant="headingMd">{section.title}</Text>
                    <Text as="p" variant="bodyMd">{section.description}</Text>
                    <Button onClick={() => void router.push(preserveHostShop(`/${locale}/${section.slug}`))}>
                      {t("openSection", { section: section.title })}
                    </Button>
                  </BlockStack>
                </Card>
              ))}
            </InlineGrid>
          </Layout.Section>
        </Layout>
      </Page>
    </>
  );
}
