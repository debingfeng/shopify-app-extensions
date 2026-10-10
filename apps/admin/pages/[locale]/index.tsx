"use client";

import type { GetServerSideProps } from "next";
import { BlockStack, Card, Layout, Page, Text } from "@shopify/polaris";
import { useTranslations } from "next-intl";

import { getLocalePageProps } from "@/lib/i18n/pages";

export const getServerSideProps: GetServerSideProps = getLocalePageProps;

export default function DashboardPage() {
  const t = useTranslations("Dashboard");

  return (
    <Page title={t("title")}>
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="200">
              <Text as="p" variant="bodyMd">
                {t("title")}
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
