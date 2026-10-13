"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { BlockStack, Button, Card, InlineStack, Text, TextField } from "@shopify/polaris";
import { useDirtyForm } from "@standhigher/shopify-app-kit/save-flow";

import { resolveLocaleValue } from "@/lib/i18n/pages";

const INITIAL_NAME = "Standhigher Demo Shop";

const COPY = {
  en: {
    heading: "Local settings form",
    note: "The useDirtyForm hook tracks unsaved changes. Save and discard affect only this browser demo.",
    label: "Display name",
    saved: "Saved value",
    state: "Form state",
    save: "Save draft",
    discard: "Discard changes",
    emptyError: "Enter a display name before saving.",
    idle: "No changes",
    dirty: "Unsaved changes",
    saving: "Saving",
    savedStatus: "Saved",
    error: "Save failed",
  },
  "zh-CN": {
    heading: "本地设置表单",
    note: "useDirtyForm Hook 跟踪未保存的修改；保存和放弃只影响此浏览器示例。",
    label: "显示名称",
    saved: "已保存的值",
    state: "表单状态",
    save: "保存草稿",
    discard: "放弃修改",
    emptyError: "保存前请输入显示名称。",
    idle: "无改动",
    dirty: "有未保存改动",
    saving: "保存中",
    savedStatus: "已保存",
    error: "保存失败",
  },
} as const;

export default function ShopifyAppKitDemo() {
  const router = useRouter();
  const locale = resolveLocaleValue(router.query.locale);
  const copy = COPY[locale];
  const [savedName, setSavedName] = useState(INITIAL_NAME);
  const [draftName, setDraftName] = useState(INITIAL_NAME);
  const form = useDirtyForm({
    initialValue: savedName,
    value: draftName,
    onSave: (value) => {
      if (!value.trim()) throw new Error(copy.emptyError);
      setSavedName(value.trim());
      setDraftName(value.trim());
    },
    onDiscard: () => setDraftName(savedName),
  });

  const statusLabel = {
    idle: copy.idle,
    dirty: copy.dirty,
    saving: copy.saving,
    saved: copy.savedStatus,
    error: copy.error,
  }[form.status];

  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h2" variant="headingMd">{copy.heading}</Text>
        <Text as="p" variant="bodyMd">{copy.note}</Text>
        <TextField label={copy.label} value={draftName} onChange={setDraftName} autoComplete="off" />
        <Text as="p" variant="bodyMd">{copy.saved}: {savedName}</Text>
        <Text as="p" variant="bodyMd">{copy.state}: {statusLabel}</Text>
        {form.error instanceof Error ? (
          <Text as="p" variant="bodyMd" tone="critical">{form.error.message}</Text>
        ) : null}
        <InlineStack gap="200">
          <Button variant="primary" disabled={!form.dirty || form.status === "saving"} onClick={() => void form.save().catch(() => undefined)}>
            {copy.save}
          </Button>
          <Button disabled={!form.dirty} onClick={form.discard}>{copy.discard}</Button>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}
