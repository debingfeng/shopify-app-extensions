"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { BlockStack, Card, InlineGrid, Select, Text } from "@shopify/polaris";
import { ChartCard, ChartLocalizationProvider, TrendChart } from "@standhigher/charts";

import { resolveLocaleValue } from "@/lib/i18n/pages";

type Metric = "sales" | "orders";
type Period = "7" | "14";

const SAMPLE = [
  { date: "2026-09-30", sales: 920, orders: 24 },
  { date: "2026-10-01", sales: 1180, orders: 29 },
  { date: "2026-10-02", sales: 1040, orders: 27 },
  { date: "2026-10-03", sales: 1360, orders: 33 },
  { date: "2026-10-04", sales: 1280, orders: 31 },
  { date: "2026-10-05", sales: 1510, orders: 36 },
  { date: "2026-10-06", sales: 1430, orders: 34 },
  { date: "2026-10-07", sales: 1640, orders: 39 },
  { date: "2026-10-08", sales: 1580, orders: 37 },
  { date: "2026-10-09", sales: 1720, orders: 42 },
  { date: "2026-10-10", sales: 1810, orders: 44 },
  { date: "2026-10-11", sales: 1690, orders: 40 },
  { date: "2026-10-12", sales: 1940, orders: 47 },
  { date: "2026-10-13", sales: 2060, orders: 50 },
];

const COPY = {
  en: {
    heading: "Sample analytics",
    note: "Local sample data for this demo; no Shopify analytics API is called.",
    metric: "Metric",
    sales: "Gross sales",
    orders: "Orders",
    period: "Date range",
    sevenDays: "Last 7 days",
    fourteenDays: "Last 14 days",
    chartTitle: "Daily trend",
    chartDescription: "Daily sample values for the selected metric and date range.",
  },
  "zh-CN": {
    heading: "模拟分析数据",
    note: "仅使用本地模拟数据，不调用 Shopify Analytics API。",
    metric: "指标",
    sales: "销售总额",
    orders: "订单数",
    period: "日期范围",
    sevenDays: "最近 7 天",
    fourteenDays: "最近 14 天",
    chartTitle: "每日趋势",
    chartDescription: "所选指标及日期范围的每日模拟数值。",
  },
} as const;

export default function ChartsDemo() {
  const router = useRouter();
  const locale = resolveLocaleValue(router.query.locale);
  const copy = COPY[locale];
  const [metric, setMetric] = useState<Metric>("sales");
  const [period, setPeriod] = useState<Period>("7");
  const data = SAMPLE.slice(-Number(period));
  const total = data.reduce((sum, day) => sum + day[metric], 0);
  const metricLabel = metric === "sales" ? copy.sales : copy.orders;
  const formattedTotal = new Intl.NumberFormat(locale === "zh-CN" ? "zh-CN" : "en-US", {
    style: metric === "sales" ? "currency" : "decimal",
    ...(metric === "sales" ? { currency: "USD", maximumFractionDigits: 0 } : {}),
  }).format(total);

  return (
    <ChartLocalizationProvider locale={locale === "zh-CN" ? "zh-CN" : "en-US"} currency="USD" timeZone="UTC">
      <BlockStack gap="400">
        <Card>
          <BlockStack gap="400">
            <Text as="h2" variant="headingMd">{copy.heading}</Text>
            <Text as="p" variant="bodyMd">{copy.note}</Text>
            <InlineGrid columns={{ xs: 1, sm: 2 }} gap="400">
              <Select
                label={copy.metric}
                options={[{ label: copy.sales, value: "sales" }, { label: copy.orders, value: "orders" }]}
                value={metric}
                onChange={(value) => setMetric(value as Metric)}
              />
              <Select
                label={copy.period}
                options={[{ label: copy.sevenDays, value: "7" }, { label: copy.fourteenDays, value: "14" }]}
                value={period}
                onChange={(value) => setPeriod(value as Period)}
              />
            </InlineGrid>
          </BlockStack>
        </Card>
        <ChartCard title={copy.chartTitle} subtitle={metricLabel} metric={formattedTotal} state="ready">
          <TrendChart
            accessibility={{ label: `${copy.chartTitle}: ${metricLabel}`, description: copy.chartDescription }}
            data={data}
            xKey="date"
            xFormat="date"
            series={[{ id: metric, label: metricLabel, data }]}
            format={metric === "sales" ? "currency" : "number"}
            height={280}
          />
        </ChartCard>
      </BlockStack>
    </ChartLocalizationProvider>
  );
}
