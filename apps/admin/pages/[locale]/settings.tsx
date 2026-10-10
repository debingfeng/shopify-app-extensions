"use client";

import type { GetServerSideProps } from "next";
import { Card, Layout, Page, Text } from "@shopify/polaris";
import { useTranslations } from "next-intl";

import { getLocalePageProps } from "@/lib/i18n/pages";

export const getServerSideProps: GetServerSideProps = getLocalePageProps;

export default function SettingsPage() {
  const t = useTranslations("Settings");

  return (
    <Page title={t("title")}>
      <Layout>
        <Layout.Section>
          <Card>
            <Text as="p" variant="bodyMd">
              {t("title")}
            </Text>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
