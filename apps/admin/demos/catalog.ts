import type { GetServerSidePropsContext } from "next";

import { getLocalePageProps } from "@/lib/i18n/pages";
import type { Locale } from "@/lib/i18n/routing";

export type DemoCategory = "packages" | "extensions" | "capabilities";
export type DemoStatus = "planned" | "sourceReady" | "localVerified" | "storeVerified";
export type LocalizedText = Record<Locale, string>;

export type DemoEntry = {
  slug: string;
  title: LocalizedText;
  summary: LocalizedText;
  scenario: LocalizedText;
  interaction: LocalizedText;
  usage: LocalizedText;
  environment: LocalizedText;
  prerequisites: LocalizedText[];
  status: DemoStatus;
};

export const demoCatalog: Record<DemoCategory, DemoEntry[]> = {
  packages: [
    {
      slug: "polaris-data-table",
      title: { en: "Polaris Data Table", "zh-CN": "Polaris 数据表格" },
      summary: {
        en: "Table, filtering, and pagination examples for Shopify admin pages.",
        "zh-CN": "面向 Shopify Admin 页面的表格、筛选与分页示例。",
      },
      scenario: {
        en: "Explore a small product list with common table controls.",
        "zh-CN": "通过小型商品列表体验常见表格操作。",
      },
      interaction: {
        en: "Use the table below to search, filter, sort, select rows, and change pages.",
        "zh-CN": "使用下方表格搜索、筛选、排序、选择行并翻页。",
      },
      usage: {
        en: "Import Table from @standhigher/polaris-data-table and control query, page data, and selection in the host page.",
        "zh-CN": "从 @standhigher/polaris-data-table 导入 Table，并在宿主页面控制 query、分页数据与选择状态。",
      },
      environment: {
        en: "Embedded Admin page (React and Polaris)",
        "zh-CN": "Embedded Admin 页面（React 与 Polaris）",
      },
      prerequisites: [
        { en: "Open the app from Shopify Admin.", "zh-CN": "从 Shopify Admin 打开应用。" },
      ],
      status: "localVerified",
    },
    {
      slug: "shopify-app-kit",
      title: { en: "Shopify App Kit", "zh-CN": "Shopify App Kit" },
      summary: {
        en: "A focused form save flow using the package hook, within the existing Admin shell.",
        "zh-CN": "在现有 Admin 壳层中体验包提供的表单保存流程 Hook。",
      },
      scenario: {
        en: "Edit a store setting, then save or discard the draft.",
        "zh-CN": "编辑一项店铺设置，并保存或放弃草稿。",
      },
      interaction: {
        en: "Change the field and try Save or Discard. Data stays in this demo only.",
        "zh-CN": "修改字段后尝试保存或放弃；数据仅保留在本次演示中。",
      },
      usage: {
        en: "Import useDirtyForm from @standhigher/shopify-app-kit/save-flow.",
        "zh-CN": "从 @standhigher/shopify-app-kit/save-flow 导入 useDirtyForm。",
      },
      environment: {
        en: "Embedded Admin page (React and Polaris)",
        "zh-CN": "Embedded Admin 页面（React 与 Polaris）",
      },
      prerequisites: [
        { en: "Open the app from Shopify Admin.", "zh-CN": "从 Shopify Admin 打开应用。" },
      ],
      status: "localVerified",
    },
  ],
  extensions: [
    {
      slug: "admin-ui-logistics",
      title: { en: "Admin UI logistics", "zh-CN": "Admin UI 物流示例" },
      summary: {
        en: "Order block, action, and selection action examples already in this repository.",
        "zh-CN": "仓库中已有的订单 Block、Action 与 Selection Action 示例。",
      },
      scenario: {
        en: "View and refresh mock logistics state from order pages.",
        "zh-CN": "在订单页面查看和刷新模拟物流状态。",
      },
      interaction: {
        en: "Run the App with Shopify CLI, then open the order page in a test store.",
        "zh-CN": "通过 Shopify CLI 运行 App，再在测试店铺打开订单页面。",
      },
      usage: {
        en: "See docs/admin-ui-extensions for setup and target details.",
        "zh-CN": "设置步骤和 target 说明见 docs/admin-ui-extensions。",
      },
      environment: {
        en: "Shopify Admin order details and order index pages",
        "zh-CN": "Shopify Admin 订单详情与订单列表页面",
      },
      prerequisites: [
        { en: "A development store with the app installed.", "zh-CN": "已安装本 App 的开发店铺。" },
        { en: "A test order for the order targets.", "zh-CN": "用于订单 target 的测试订单。" },
      ],
      status: "sourceReady",
    },
  ],
  capabilities: [
    {
      slug: "app-bridge-token",
      title: { en: "App Bridge ID token", "zh-CN": "App Bridge ID Token" },
      summary: {
        en: "Inspect the request flow for a short-lived embedded app token.",
        "zh-CN": "了解嵌入式 App 短期 Token 的请求流程。",
      },
      scenario: {
        en: "Request an ID token before calling a protected app endpoint.",
        "zh-CN": "调用受保护的 App 接口前获取 ID Token。",
      },
      interaction: {
        en: "A safe request demo will be added here.",
        "zh-CN": "安全的请求示例将在这里接入。",
      },
      usage: {
        en: "Reuse the existing useTokenProvider hook.",
        "zh-CN": "复用现有的 useTokenProvider Hook。",
      },
      environment: {
        en: "Embedded Admin page and app backend",
        "zh-CN": "Embedded Admin 页面与 App 后端",
      },
      prerequisites: [
        { en: "Open the app from Shopify Admin.", "zh-CN": "从 Shopify Admin 打开应用。" },
      ],
      status: "planned",
    },
  ],
};

export function getDemoEntry(category: DemoCategory, slug: string) {
  return demoCatalog[category].find((entry) => entry.slug === slug);
}

export async function getDemoDetailProps(
  category: DemoCategory,
  context: GetServerSidePropsContext,
) {
  const slug = context.params?.slug;
  if (typeof slug !== "string" || !getDemoEntry(category, slug)) {
    return { notFound: true as const };
  }
  return getLocalePageProps(context);
}
