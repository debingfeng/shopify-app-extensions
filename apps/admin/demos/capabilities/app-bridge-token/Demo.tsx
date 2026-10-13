"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { Banner, BlockStack, Button, Card, Text } from "@shopify/polaris";

import { useTokenProvider } from "@/lib/api/useTokenProvider";
import { resolveLocaleValue } from "@/lib/i18n/pages";

const COPY = {
  en: {
    heading: "Request an App Bridge token",
    note: "The token is kept in memory for this request only and is never rendered, logged, or sent to the mock API.",
    action: "Request token",
    loading: "Requesting...",
    idle: "No request has been made yet.",
    success: "App Bridge returned a token. Backend verification is a separate step.",
    error: "App Bridge did not return a token. Open this page inside an installed Shopify app and retry.",
  },
  "zh-CN": {
    heading: "请求 App Bridge Token",
    note: "Token 仅在本次请求中留于内存，不会显示、记录或发送给 Mock API。",
    action: "请求 Token",
    loading: "请求中...",
    idle: "尚未发起请求。",
    success: "App Bridge 已返回 Token；后端验证是独立步骤。",
    error: "App Bridge 未返回 Token。请在已安装 App 的 Shopify Admin 内打开此页后重试。",
  },
} as const;

export default function AppBridgeTokenDemo() {
  const router = useRouter();
  const copy = COPY[resolveLocaleValue(router.query.locale)];
  const getToken = useTokenProvider();
  const [state, setState] = useState<"idle" | "success" | "error">("idle");
  const [loading, setLoading] = useState(false);

  async function requestToken() {
    setLoading(true);
    try {
      const token = await getToken();
      setState(token ? "success" : "error");
    } catch {
      setState("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h2" variant="headingMd">{copy.heading}</Text>
        <Text as="p" variant="bodyMd">{copy.note}</Text>
        <Button onClick={requestToken} loading={loading}>{loading ? copy.loading : copy.action}</Button>
        {state === "idle" ? <Text as="p" variant="bodyMd">{copy.idle}</Text> : null}
        {state === "success" ? <Banner tone="success">{copy.success}</Banner> : null}
        {state === "error" ? <Banner tone="critical">{copy.error}</Banner> : null}
      </BlockStack>
    </Card>
  );
}
