import type { ReactNode } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Badge, BlockStack, Card, InlineStack, Layout, Page, Text } from "@shopify/polaris";
import { useTranslations } from "next-intl";

import type { DemoEntry } from "@/demos/catalog";
import { resolveLocaleValue } from "@/lib/i18n/pages";

type DemoDetailPageProps = {
  entry: DemoEntry;
  children?: ReactNode;
};

export default function DemoDetailPage({ entry, children }: DemoDetailPageProps) {
  const router = useRouter();
  const locale = resolveLocaleValue(router.query.locale);
  const t = useTranslations("Demos");

  return (
    <>
      <Head><title>{entry.title[locale]} | Standhigher Lab</title></Head>
      <Page title={entry.title[locale]}>
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <InlineStack><Badge>{t(`status.${entry.status}`)}</Badge></InlineStack>
                <Text as="p" variant="bodyLg">{entry.summary[locale]}</Text>
                <Text as="h2" variant="headingMd">{t("scenario")}</Text>
                <Text as="p" variant="bodyMd">{entry.scenario[locale]}</Text>
                <Text as="h2" variant="headingMd">{t("interaction")}</Text>
                <Text as="p" variant="bodyMd">{entry.interaction[locale]}</Text>
                <Text as="h2" variant="headingMd">{t("usage")}</Text>
                <Text as="p" variant="bodyMd">{entry.usage[locale]}</Text>
                <Text as="h2" variant="headingMd">{t("environment")}</Text>
                <Text as="p" variant="bodyMd">{entry.environment[locale]}</Text>
                <Text as="h2" variant="headingMd">{t("prerequisites")}</Text>
                {entry.prerequisites.map((item) => (
                  <Text as="p" variant="bodyMd" key={item.en}>{item[locale]}</Text>
                ))}
              </BlockStack>
            </Card>
          </Layout.Section>
          {children ? <Layout.Section>{children}</Layout.Section> : null}
        </Layout>
      </Page>
    </>
  );
}
