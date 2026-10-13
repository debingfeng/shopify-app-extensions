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
  sourcePaths?: string[];
  targets?: string[];
  docsPath?: string;
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
      sourcePaths: [
        "extensions/admin-ui-logistics-block",
        "extensions/admin-ui-logistics-demo",
        "extensions/admin-ui-logistics-selection",
      ],
      targets: [
        "admin.order-details.block.render",
        "admin.order-details.action.render",
        "admin.order-index.selection-action.render",
      ],
      docsPath: "docs/admin-ui-extensions/04-local-development-and-release.md",
    },
    {
      slug: "checkout-ui-learning",
      title: { en: "Checkout UI learning", "zh-CN": "Checkout UI 学习示例" },
      summary: {
        en: "Ten focused Checkout and Thank You UI scenarios in one extension.",
        "zh-CN": "一个扩展中的 10 个 Checkout 与 Thank You UI 场景。",
      },
      scenario: {
        en: "Try banners, cart offers, discounts, shipping, buyer information, and order confirmation UI.",
        "zh-CN": "体验横幅、购物车推荐、折扣、配送、买家信息和订单确认 UI。",
      },
      interaction: {
        en: "Run pnpm app:dev, add a target in Checkout Editor, then preview a test checkout or Thank You page. Configure demo settings in the editor where required.",
        "zh-CN": "运行 pnpm app:dev，在 Checkout Editor 添加 target，再预览测试结账或 Thank You 页面；按需在编辑器配置 Demo 参数。",
      },
      usage: {
        en: "The UI runs in Shopify Checkout, not inside this Admin guide. See the scenario guide for each target and test step.",
        "zh-CN": "UI 在 Shopify Checkout 中运行，不在此 Admin 指南内运行；各 target 和测试步骤见场景文档。",
      },
      environment: {
        en: "Shopify Checkout and Thank You extension runtime",
        "zh-CN": "Shopify Checkout 与 Thank You 扩展运行环境",
      },
      prerequisites: [
        { en: "A test store with the required Checkout Extensibility and plan support.", "zh-CN": "具备相应 Checkout Extensibility 与套餐能力的测试店铺。" },
        { en: "A test product and checkout; some demos require a variant GID, HTTPS URL, or customer data access.", "zh-CN": "测试商品与结账；部分 Demo 还需变体 GID、HTTPS URL 或客户数据权限。" },
      ],
      status: "sourceReady",
      sourcePaths: ["extensions/checkout-ui-learning"],
      targets: [
        "purchase.checkout.block.render",
        "purchase.checkout.cart-line-list.render-after",
        "purchase.checkout.footer.render-after",
        "purchase.checkout.contact.render-after",
        "purchase.checkout.delivery-address.render-after",
        "purchase.checkout.payment-method-list.render-after",
        "purchase.checkout.header.render-after",
        "purchase.checkout.reductions.render-after",
        "purchase.checkout.chat.render",
        "purchase.thank-you.block.render",
      ],
      docsPath: "docs/checkout-ui/scenarios.md",
    },
    {
      slug: "order-status-learning",
      title: { en: "Customer Account order status", "zh-CN": "Customer Account 订单状态" },
      summary: {
        en: "Read order status and show a configured tracking link in Customer Account.",
        "zh-CN": "在 Customer Account 中读取订单状态并展示配置的物流链接。",
      },
      scenario: {
        en: "Show order details and tracking entry to a signed-in customer.",
        "zh-CN": "向已登录顾客展示订单信息和物流入口。",
      },
      interaction: {
        en: "Run pnpm app:dev, add the block in the Customer Account editor, and open a test order status page.",
        "zh-CN": "运行 pnpm app:dev，在 Customer Account 编辑器添加 Block，并打开测试订单状态页。",
      },
      usage: {
        en: "This extension has its own Customer Account target and runs outside the Admin and Checkout UI runtimes.",
        "zh-CN": "该扩展使用独立的 Customer Account target，运行环境不同于 Admin 和 Checkout UI。",
      },
      environment: {
        en: "Shopify Customer Account order status page",
        "zh-CN": "Shopify Customer Account 订单状态页",
      },
      prerequisites: [
        { en: "A test store with Customer Accounts enabled and a test order.", "zh-CN": "启用 Customer Accounts 且有测试订单的店铺。" },
        { en: "A signed-in customer and any required protected customer data access.", "zh-CN": "已登录顾客及所需的受保护客户数据权限。" },
      ],
      status: "sourceReady",
      sourcePaths: ["extensions/order-status-learning"],
      targets: ["customer-account.order-status.block.render"],
      docsPath: "docs/checkout-ui/scenarios.md",
    },
    {
      slug: "checkout-validation-function",
      title: { en: "Checkout validation Function", "zh-CN": "Checkout Validation Function" },
      summary: {
        en: "A cart validation rule executed by Shopify during checkout.",
        "zh-CN": "由 Shopify 在结账时执行的购物车校验规则。",
      },
      scenario: {
        en: "Reject a cart line that exceeds the demo quantity limit.",
        "zh-CN": "拦截超过示例数量限制的购物车商品行。",
      },
      interaction: {
        en: "Review the fixtures locally, then deploy and enable the Function in a capable test store before testing checkout.",
        "zh-CN": "先检查本地测试数据，再在支持该能力的测试店铺部署并启用 Function，最后测试结账。",
      },
      usage: {
        en: "Shopify executes the Function; the Admin page only describes it and cannot invoke it as an extension.",
        "zh-CN": "Function 由 Shopify 执行；Admin 页面仅作说明，不能作为扩展直接调用它。",
      },
      environment: {
        en: "Shopify cart validation Function runtime",
        "zh-CN": "Shopify 购物车校验 Function 运行环境",
      },
      prerequisites: [
        { en: "A test store with the required Function capability and an enabled validation rule.", "zh-CN": "具备对应 Function 能力且已启用校验规则的测试店铺。" },
      ],
      status: "sourceReady",
      sourcePaths: ["extensions/checkout-validation-function"],
      targets: ["cart.validations.generate.run"],
      docsPath: "docs/checkout-ui/scenarios.md",
    },
    {
      slug: "discount-rules-function",
      title: { en: "Discount rules Function", "zh-CN": "Discount Rules Function" },
      summary: {
        en: "Product and delivery discount rules executed by Shopify.",
        "zh-CN": "由 Shopify 执行的商品与配送折扣规则。",
      },
      scenario: {
        en: "Apply the demo discount to qualifying cart lines or delivery options.",
        "zh-CN": "对符合条件的购物车商品行或配送选项应用示例折扣。",
      },
      interaction: {
        en: "Review local fixtures, then deploy and activate the discount in a capable test store and inspect checkout totals.",
        "zh-CN": "检查本地测试数据后，在支持该能力的测试店铺部署并激活折扣，再核对结账金额。",
      },
      usage: {
        en: "Shopify invokes the Function when the discount is active; Checkout UI cannot call it directly.",
        "zh-CN": "折扣激活后由 Shopify 调用 Function；Checkout UI 无法直接调用它。",
      },
      environment: {
        en: "Shopify discount Function runtime",
        "zh-CN": "Shopify 折扣 Function 运行环境",
      },
      prerequisites: [
        { en: "A test store with the required discount Function capability and an active test discount.", "zh-CN": "具备折扣 Function 能力且已激活测试折扣的店铺。" },
      ],
      status: "sourceReady",
      sourcePaths: ["extensions/discount-rules-function"],
      targets: [
        "cart.lines.discounts.generate.run",
        "cart.delivery-options.discounts.generate.run",
      ],
      docsPath: "docs/checkout-ui/scenarios.md",
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
