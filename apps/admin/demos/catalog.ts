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
      slug: "puck-page-builder",
      title: { en: "Puck page builder", "zh-CN": "Puck 页面编辑器" },
      summary: {
        en: "Compose a small page document from registered blocks, with local in-memory save.",
        "zh-CN": "使用注册区块组合简易页面文档，并在页面内存中保存。",
      },
      scenario: {
        en: "Build a short informational page from a heading and body block.",
        "zh-CN": "用标题和正文区块搭建一张简短说明页。",
      },
      interaction: {
        en: "Add or edit a Lab message block, then use Save. Refreshing the page resets the draft.",
        "zh-CN": "添加或编辑 Lab message 区块后点击保存；刷新页面会重置草稿。",
      },
      usage: {
        en: "Define a block in an immutable extension registry and pass a PageDocument to PageDocumentEditorShell. No Shopify data or publishing adapter is connected.",
        "zh-CN": "在不可变 Extension Registry 中定义区块，再将 PageDocument 传给 PageDocumentEditorShell；不接入 Shopify 数据或发布适配器。",
      },
      environment: {
        en: "Embedded Admin page (client-side Puck editor)",
        "zh-CN": "Embedded Admin 页面（客户端 Puck 编辑器）",
      },
      prerequisites: [
        { en: "Open the app from Shopify Admin. The draft stays in this browser page only.", "zh-CN": "从 Shopify Admin 打开应用；草稿仅保留在当前浏览器页面。" },
      ],
      status: "localVerified",
    },
    {
      slug: "rich-text",
      title: { en: "Rich text toolkit", "zh-CN": "富文本工具包" },
      summary: {
        en: "Edit Tiptap JSON and preview sanitized Shopify HTML through the server package.",
        "zh-CN": "编辑 Tiptap JSON，并通过服务端包预览净化后的 Shopify HTML。",
      },
      scenario: {
        en: "Draft a short product description and inspect its safe HTML output.",
        "zh-CN": "编写一段商品描述并查看安全的 HTML 输出。",
      },
      interaction: {
        en: "Edit the content, then click Generate preview. The demo does not save to Shopify.",
        "zh-CN": "编辑内容后点击生成预览；示例不会保存到 Shopify。",
      },
      usage: {
        en: "The editor supplies JSON; rich-text-core wraps it; rich-text-server validates and renders HTML. Published editor 1.0.0 declares Polaris 12, while this lab uses Polaris 13; verify this combination again before production use.",
        "zh-CN": "编辑器输出 JSON，rich-text-core 包装文档，rich-text-server 验证并渲染 HTML。已发布编辑器 1.0.0 声明支持 Polaris 12，而本实验室使用 Polaris 13；生产使用前需重新核对兼容性。",
      },
      environment: {
        en: "Embedded Admin editor and local Next.js preview API",
        "zh-CN": "Embedded Admin 编辑器与本地 Next.js 预览 API",
      },
      prerequisites: [
        { en: "Open the app from Shopify Admin. Preview uses only the content you enter.", "zh-CN": "从 Shopify Admin 打开应用；预览仅处理你输入的内容。" },
      ],
      status: "localVerified",
    },
    {
      slug: "charts",
      title: { en: "Charts", "zh-CN": "数据图表" },
      summary: {
        en: "Interactive trend chart for app-owned sample analytics.",
        "zh-CN": "基于 App 模拟分析数据的交互式趋势图。",
      },
      scenario: {
        en: "Compare sample sales and order counts across short date ranges.",
        "zh-CN": "对比短时间范围内的模拟销售额与订单数。",
      },
      interaction: {
        en: "Switch the metric and date range; hover chart points to inspect values.",
        "zh-CN": "切换指标和日期范围，并悬停图表节点查看数值。",
      },
      usage: {
        en: "Use ChartLocalizationProvider, ChartCard, and TrendChart from @standhigher/charts. The host app provides data and Recharts 3.",
        "zh-CN": "使用 @standhigher/charts 的 ChartLocalizationProvider、ChartCard 和 TrendChart；宿主 App 提供数据与 Recharts 3。",
      },
      environment: {
        en: "Embedded Admin page (React 18.3 and Polaris)",
        "zh-CN": "Embedded Admin 页面（React 18.3 与 Polaris）",
      },
      prerequisites: [
        { en: "Open the app from Shopify Admin. This demo uses local sample data only.", "zh-CN": "从 Shopify Admin 打开应用；此示例仅使用本地模拟数据。" },
      ],
      status: "localVerified",
    },
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
      slug: "sidekick-demo-search",
      title: { en: "Sidekick demo search", "zh-CN": "Sidekick 演示搜索" },
      summary: {
        en: "A read-only Sidekick tool that finds Lab demos and returns embedded app links.",
        "zh-CN": "只读 Sidekick 工具：搜索 Lab 演示并返回 Embedded App 页面链接。",
      },
      scenario: {
        en: "Ask Sidekick which package or Shopify extension examples are available in Standhigher Lab.",
        "zh-CN": "向 Sidekick 询问 Standhigher Lab 中有哪些 npm 包或 Shopify Extension 示例。",
      },
      interaction: {
        en: "Install the App in a test store, ask Sidekick for a Lab topic, and open a returned demo link.",
        "zh-CN": "在测试店铺安装 App，向 Sidekick 询问 Lab 主题，再打开返回的 Demo 链接。",
      },
      usage: {
        en: "The tool searches a small static index in the extension sandbox. It does not access the store or call the App backend.",
        "zh-CN": "工具在扩展沙箱中搜索小型静态索引；不访问店铺数据，也不调用 App 后端。",
      },
      environment: {
        en: "Shopify Sidekick admin.app.tools.data sandbox",
        "zh-CN": "Shopify Sidekick admin.app.tools.data 沙箱",
      },
      prerequisites: [
        { en: "A test store with this App installed and Sidekick extension support.", "zh-CN": "已安装此 App 且支持 Sidekick 扩展的测试店铺。" },
      ],
      status: "sourceReady",
      sourcePaths: ["extensions/sidekick-demo-search"],
      targets: ["admin.app.tools.data · search_lab_demos"],
      docsPath: "docs/sidekick/README.md",
    },
    {
      slug: "lab-web-pixel",
      title: { en: "Web Pixel page view", "zh-CN": "Web Pixel 页面浏览" },
      summary: {
        en: "A consent-aware page-view subscription in Shopify's pixel sandbox.",
        "zh-CN": "在 Shopify Pixel 沙箱中按同意状态订阅页面浏览事件。",
      },
      scenario: {
        en: "Observe that a storefront page visit emits a customer event.",
        "zh-CN": "观察店铺前台访问如何产生顾客事件。",
      },
      interaction: {
        en: "Build the extension, create the store's Web Pixel record, then inspect the storefront console after analytics consent.",
        "zh-CN": "构建扩展并在店铺创建 Web Pixel 记录，在获得 analytics 同意后查看前台 Console。",
      },
      usage: {
        en: "The Pixel logs only the event name and an in-memory count. It makes no tracking request and does not run inside this Admin page.",
        "zh-CN": "Pixel 仅记录事件名称和内存计数，不发送追踪请求，也不在此 Admin 页面运行。",
      },
      environment: {
        en: "Shopify Web Pixel strict sandbox on the online store",
        "zh-CN": "店铺前台的 Shopify Web Pixel strict sandbox",
      },
      prerequisites: [
        { en: "The App is installed with write_pixels and read_customer_events scopes, and its Web Pixel record is connected.", "zh-CN": "App 已获 write_pixels、read_customer_events scope，且 Web Pixel 记录已连接。" },
        { en: "A test storefront and analytics consent are available.", "zh-CN": "可访问的测试店铺前台和 analytics 同意状态。" },
      ],
      status: "sourceReady",
      sourcePaths: ["extensions/lab-web-pixel"],
      targets: ["web_pixel_extension · page_viewed"],
      docsPath: "docs/web-pixel/README.md",
    },
    {
      slug: "flow-acknowledge",
      title: { en: "Flow acknowledge action", "zh-CN": "Flow 备注确认 Action" },
      summary: {
        en: "A signed Flow action that acknowledges a short note without a business side effect.",
        "zh-CN": "验证签名后确认收到短备注、且无业务副作用的 Flow Action。",
      },
      scenario: {
        en: "Add a small custom step to a test automation workflow.",
        "zh-CN": "在测试自动化工作流中加入一个小型自定义步骤。",
      },
      interaction: {
        en: "Run pnpm app:dev, add the action in Shopify Flow, enter a note, trigger the workflow, and inspect its run log.",
        "zh-CN": "运行 pnpm app:dev，在 Shopify Flow 中添加 Action、填写备注、触发工作流并查看运行日志。",
      },
      usage: {
        en: "Flow sends a signed POST to a relative HTTPS runtime URL. The App verifies HMAC and the action handle before acknowledging it.",
        "zh-CN": "Flow 向相对路径对应的 HTTPS runtime URL 发送签名 POST；App 在确认前验证 HMAC 与 Action handle。",
      },
      environment: {
        en: "Shopify Flow action and App backend endpoint",
        "zh-CN": "Shopify Flow Action 与 App 后端接口",
      },
      prerequisites: [
        { en: "A test store with this App and Shopify Flow installed; custom-app Flow tasks require Shopify Plus or a Plus dev store.", "zh-CN": "已安装此 App 与 Shopify Flow 的测试店铺；自定义 App 的 Flow 任务要求 Shopify Plus 或 Plus 开发店铺。" },
        { en: "The App backend must have SHOPIFY_API_SECRET configured.", "zh-CN": "App 后端必须配置 SHOPIFY_API_SECRET。" },
      ],
      status: "sourceReady",
      sourcePaths: ["extensions/flow-acknowledge"],
      targets: ["flow_action · /api/lab/flow-acknowledge"],
      docsPath: "docs/flow-action/README.md",
    },
    {
      slug: "theme-product-note",
      title: { en: "Theme product note", "zh-CN": "Theme 商品页说明" },
      summary: {
        en: "A configurable product-page app block for an Online Store 2.0 theme.",
        "zh-CN": "面向 Online Store 2.0 主题的可配置商品页 App Block。",
      },
      scenario: {
        en: "Let a merchant add a short product message without editing theme code.",
        "zh-CN": "让商家无需修改主题代码即可添加简短商品说明。",
      },
      interaction: {
        en: "Run pnpm app:dev, add Lab product note to a product template in the theme editor, and change its heading and description.",
        "zh-CN": "运行 pnpm app:dev，在主题编辑器的商品模板添加 Lab product note，并修改标题和说明。",
      },
      usage: {
        en: "The Liquid block runs in the storefront theme. This Admin page is only a guide; storefront preview awaits an installed test app.",
        "zh-CN": "Liquid Block 运行在店铺主题中；此 Admin 页面仅作指南，前台预览待测试 App 安装后验证。",
      },
      environment: {
        en: "Online Store 2.0 product template",
        "zh-CN": "Online Store 2.0 商品模板",
      },
      prerequisites: [
        { en: "A test store with this app installed, a product, and an Online Store 2.0 theme that supports app blocks.", "zh-CN": "已安装此 App、存在商品且使用支持 App Block 的 Online Store 2.0 主题的测试店铺。" },
      ],
      status: "sourceReady",
      sourcePaths: ["extensions/theme-product-note"],
      targets: ["Theme app block · section · product template"],
      docsPath: "docs/theme-app-extension/README.md",
    },
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
        en: "Request a token from App Bridge and inspect only the result state. The token itself is never displayed or logged.",
        "zh-CN": "向 App Bridge 请求 Token，仅查看结果状态；Token 本身不会显示或记录。",
      },
      usage: {
        en: "Reuse the existing useTokenProvider hook. Receiving a token in the browser does not validate its signature or authorize backend requests.",
        "zh-CN": "复用现有 useTokenProvider Hook；浏览器收到 Token 不代表已验证签名或获得后端请求授权。",
      },
      environment: {
        en: "Embedded Admin page and app backend",
        "zh-CN": "Embedded Admin 页面与 App 后端",
      },
      prerequisites: [
        { en: "Open the app from Shopify Admin.", "zh-CN": "从 Shopify Admin 打开应用。" },
      ],
      status: "localVerified",
    },
    {
      slug: "mock-api-debug",
      title: { en: "Mock API and error states", "zh-CN": "Mock API 与错误状态" },
      summary: {
        en: "Inspect success and failure responses from a local read-only endpoint.",
        "zh-CN": "观察本地只读接口的成功与失败响应。",
      },
      scenario: {
        en: "See how a page reports HTTP status, elapsed time, and request ID.",
        "zh-CN": "查看页面如何展示 HTTP 状态、耗时和请求 ID。",
      },
      interaction: {
        en: "Choose a response type and send a request. No Shopify data or token is sent.",
        "zh-CN": "选择响应类型并发送请求；不会发送 Shopify 数据或 Token。",
      },
      usage: {
        en: "Use the local /api/lab/mock-response endpoint to exercise explicit success, validation, and server-error UI.",
        "zh-CN": "通过本地 /api/lab/mock-response 接口体验成功、校验失败和服务端错误 UI。",
      },
      environment: {
        en: "Embedded Admin page and local Next.js API",
        "zh-CN": "Embedded Admin 页面与本地 Next.js API",
      },
      prerequisites: [
        { en: "Open the app from Shopify Admin, or use the local UI stub for frontend checks.", "zh-CN": "从 Shopify Admin 打开应用；前端检查也可使用本地 UI stub。" },
      ],
      status: "localVerified",
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
