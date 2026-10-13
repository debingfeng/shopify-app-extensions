"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/router";
import { Banner, BlockStack, Button, Card, Text } from "@shopify/polaris";
import { PageDocumentEditorShell, type PageDocument } from "@standhigher/puck-page-builder";
import { createExtensionRegistry, type BlockDefinition } from "@standhigher/puck-page-builder/extensions";
import { createPageDocument } from "@standhigher/puck-page-builder/schema";

import { resolveLocaleValue } from "@/lib/i18n/pages";

const messageBlock: BlockDefinition = {
  type: "standhigher.lab.message",
  version: 1,
  label: "Lab message",
  category: "Standhigher Lab",
  targets: ["web"],
  defaultProps: { title: "A new section", body: "Edit this text in the inspector." },
  fields: {
    title: { field: "standhigher.text", control: "text", label: "Title", required: true },
    body: { field: "standhigher.text", control: "textarea", label: "Body" },
  },
  render: {
    web: ({ title, body }) => (
      <section style={{ padding: "24px", border: "1px solid #d3d7dc", borderRadius: "8px" }}>
        <h2>{String(title ?? "")}</h2>
        <p>{String(body ?? "")}</p>
      </section>
    ),
  },
};

const registry = createExtensionRegistry([{
  name: "standhigher.lab",
  version: "1.0.0",
  blocks: [messageBlock],
}]);

const initialDocument = createPageDocument({
  pageId: "standhigher-lab-demo",
  target: "web",
  settings: { locale: "en" },
  blocks: [{
    id: "intro",
    type: messageBlock.type,
    version: 1,
    props: { title: "Standhigher Lab", body: "A local page builder example." },
  }],
});

const COPY = {
  en: {
    heading: "Local page document",
    note: "Edit the page below. Save copies a snapshot only into this page; publishing stays disabled and no Shopify page is created.",
    save: "Save local snapshot",
    saved: "Saved locally: {count} block(s).",
    savedTitle: "Saved first title: {title}",
  },
  "zh-CN": {
    heading: "本地页面文档",
    note: "在下方编辑页面。保存仅将快照复制到当前页面状态；发布保持禁用，不会创建 Shopify 页面。",
    save: "保存本地快照",
    saved: "已在本地保存：{count} 个区块。",
    savedTitle: "已保存的首个标题：{title}",
  },
} as const;

export default function PuckPageBuilderDemo() {
  const router = useRouter();
  const locale = resolveLocaleValue(router.query.locale);
  const copy = COPY[locale];
  const currentDocumentRef = useRef<PageDocument>(initialDocument);
  const [savedDocument, setSavedDocument] = useState<PageDocument | null>(null);

  return (
    <BlockStack gap="400">
      <Card>
        <BlockStack gap="300">
          <Text as="h2" variant="headingMd">{copy.heading}</Text>
          <Text as="p" variant="bodyMd">{copy.note}</Text>
          <Button onClick={() => setSavedDocument(structuredClone(currentDocumentRef.current))}>{copy.save}</Button>
          {savedDocument ? (
            <Banner tone="success">
              <BlockStack gap="100">
                <Text as="p" variant="bodyMd">{copy.saved.replace("{count}", String(savedDocument.blocks.length))}</Text>
                {savedDocument.blocks[0] ? (
                  <Text as="p" variant="bodyMd">{copy.savedTitle.replace("{title}", String(savedDocument.blocks[0].props.title ?? ""))}</Text>
                ) : null}
              </BlockStack>
            </Banner>
          ) : null}
        </BlockStack>
      </Card>
      <PageDocumentEditorShell
        initialDocument={initialDocument}
        registry={registry}
        adminLocale={locale}
        onDocumentChange={(document) => { currentDocumentRef.current = document; }}
      />
    </BlockStack>
  );
}
