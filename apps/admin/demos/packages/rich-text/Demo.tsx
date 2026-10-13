"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { Banner, BlockStack, Button, Card, Text } from "@shopify/polaris";
import { RichTextEditor, type RichTextEditorProps } from "@standhigher/shopify-rich-text-editor";

import { resolveLocaleValue } from "@/lib/i18n/pages";

type EditorContent = RichTextEditorProps["value"];

const INITIAL_CONTENT: EditorContent = {
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text: "A durable everyday tote." }] }],
};

const COPY = {
  en: {
    heading: "Product description draft",
    note: "This local demo sends the draft to a preview endpoint. No Shopify content is changed.",
    placeholder: "Describe the product...",
    generate: "Generate preview",
    generating: "Generating...",
    preview: "Sanitized Shopify HTML preview",
    empty: "Generate a preview after editing.",
    error: "The preview could not be generated. Check the content and try again.",
  },
  "zh-CN": {
    heading: "商品描述草稿",
    note: "此本地示例将草稿发送到预览接口，不会修改 Shopify 内容。",
    placeholder: "描述商品...",
    generate: "生成预览",
    generating: "生成中...",
    preview: "净化后的 Shopify HTML 预览",
    empty: "编辑后生成预览。",
    error: "无法生成预览，请检查内容后重试。",
  },
} as const;

export default function RichTextDemo() {
  const router = useRouter();
  const locale = resolveLocaleValue(router.query.locale);
  const copy = COPY[locale];
  const [content, setContent] = useState<EditorContent>(INITIAL_CONTENT);
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function generatePreview() {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch("/api/lab/rich-text-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error("Preview failed");
      const result: { html: string } = await response.json();
      setHtml(result.html);
    } catch {
      setError(true);
      setHtml(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <BlockStack gap="400">
      <Card>
        <BlockStack gap="400">
          <Text as="h2" variant="headingMd">{copy.heading}</Text>
          <Text as="p" variant="bodyMd">{copy.note}</Text>
          <RichTextEditor
            value={content}
            onChange={(value) => { setContent(value); setHtml(null); }}
            placeholder={copy.placeholder}
          />
          <Button onClick={generatePreview} loading={loading}>{loading ? copy.generating : copy.generate}</Button>
        </BlockStack>
      </Card>
      <Card>
        <BlockStack gap="400">
          <Text as="h2" variant="headingMd">{copy.preview}</Text>
          {error ? <Banner tone="critical">{copy.error}</Banner> : null}
          {html === null ? <Text as="p" variant="bodyMd">{copy.empty}</Text> : <div dangerouslySetInnerHTML={{ __html: html }} />}
        </BlockStack>
      </Card>
    </BlockStack>
  );
}
