import Head from "next/head";
import { useRouter } from "next/router";
import { Badge, BlockStack, Button, Card, InlineStack, Layout, Page, Text } from "@shopify/polaris";
import { useTranslations } from "next-intl";

import { demoCatalog, type DemoCategory } from "@/demos/catalog";
import { resolveLocaleValue } from "@/lib/i18n/pages";
import { preserveHostShop } from "@/lib/shopify/url";

type DemoListPageProps = {
  category: DemoCategory;
  title: string;
  description: string;
};

export default function DemoListPage({ category, title, description }: DemoListPageProps) {
  const router = useRouter();
  const locale = resolveLocaleValue(router.query.locale);
  const t = useTranslations("Demos");
  const entries = demoCatalog[category];

  return (
    <>
      <Head><title>{title} | Standhigher Lab</title></Head>
      <Page title={title}>
        <Layout>
          <Layout.Section>
            <Text as="p" variant="bodyLg">{description}</Text>
          </Layout.Section>
          {entries.map((entry) => (
            <Layout.Section key={entry.slug}>
              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">{entry.title[locale]}</Text>
                  <InlineStack><Badge>{t(`status.${entry.status}`)}</Badge></InlineStack>
                  <Text as="p" variant="bodyMd">{entry.summary[locale]}</Text>
                  <Button onClick={() => void router.push(preserveHostShop(`/${locale}/${category}/${entry.slug}`))}>
                    {t("viewDetails")}
                  </Button>
                </BlockStack>
              </Card>
            </Layout.Section>
          ))}
          {entries.length === 0 ? (
            <Layout.Section>
              <Card><Text as="p" variant="bodyMd">{t("empty")}</Text></Card>
            </Layout.Section>
          ) : null}
        </Layout>
      </Page>
    </>
  );
}
