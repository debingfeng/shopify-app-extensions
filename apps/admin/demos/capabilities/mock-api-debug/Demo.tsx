"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { Banner, BlockStack, Button, Card, Select, Text } from "@shopify/polaris";

import { resolveLocaleValue } from "@/lib/i18n/pages";

type Mode = "success" | "validation" | "server";
type Result = { status: number; requestId: string; elapsed: number };

const COPY = {
  en: {
    heading: "Inspect a local API response",
    note: "This endpoint returns fixed examples and a request ID. It does not read Shopify data or accept a token.",
    mode: "Response",
    success: "Success (200)",
    validation: "Validation error (422)",
    server: "Service error (503)",
    action: "Send request",
    loading: "Sending...",
    status: "HTTP status",
    requestId: "Request ID",
    elapsed: "Elapsed",
    networkError: "The request could not reach the local API.",
  },
  "zh-CN": {
    heading: "查看本地 API 响应",
    note: "此接口返回固定示例与请求 ID，不读取 Shopify 数据，也不接收 Token。",
    mode: "响应类型",
    success: "成功（200）",
    validation: "校验失败（422）",
    server: "服务错误（503）",
    action: "发送请求",
    loading: "发送中...",
    status: "HTTP 状态",
    requestId: "请求 ID",
    elapsed: "耗时",
    networkError: "无法连接本地 API。",
  },
} as const;

export default function MockApiDebugDemo() {
  const router = useRouter();
  const copy = COPY[resolveLocaleValue(router.query.locale)];
  const [mode, setMode] = useState<Mode>("success");
  const [result, setResult] = useState<Result | null>(null);
  const [networkError, setNetworkError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function sendRequest() {
    setLoading(true);
    setNetworkError(false);
    const started = performance.now();
    try {
      const response = await fetch(`/api/lab/mock-response?mode=${mode}`, { cache: "no-store" });
      const body: { requestId: string } = await response.json();
      setResult({ status: response.status, requestId: body.requestId, elapsed: Math.round(performance.now() - started) });
    } catch {
      setResult(null);
      setNetworkError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h2" variant="headingMd">{copy.heading}</Text>
        <Text as="p" variant="bodyMd">{copy.note}</Text>
        <Select
          label={copy.mode}
          options={[
            { label: copy.success, value: "success" },
            { label: copy.validation, value: "validation" },
            { label: copy.server, value: "server" },
          ]}
          value={mode}
          onChange={(value) => { setMode(value as Mode); setResult(null); }}
        />
        <Button onClick={sendRequest} loading={loading}>{loading ? copy.loading : copy.action}</Button>
        {networkError ? <Banner tone="critical">{copy.networkError}</Banner> : null}
        {result ? (
          <Banner tone={result.status < 400 ? "success" : "critical"}>
            <BlockStack gap="100">
              <Text as="p" variant="bodyMd">{copy.status}: {result.status}</Text>
              <Text as="p" variant="bodyMd">{copy.requestId}: {result.requestId}</Text>
              <Text as="p" variant="bodyMd">{copy.elapsed}: {result.elapsed} ms</Text>
            </BlockStack>
          </Banner>
        ) : null}
      </BlockStack>
    </Card>
  );
}
