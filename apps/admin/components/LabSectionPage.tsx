import Head from "next/head";
import { BlockStack, Card, Layout, Page, Text } from "@shopify/polaris";

type LabSectionPageProps = {
  title: string;
  description: string;
};

export default function LabSectionPage({ title, description }: LabSectionPageProps) {
  return (
    <>
      <Head><title>{title} | Standhigher Lab</title></Head>
      <Page title={title}>
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="200">
                <Text as="p" variant="bodyMd">{description}</Text>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    </>
  );
}
