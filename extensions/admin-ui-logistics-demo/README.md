# Admin UI Extension 物流三件套 Demo

这个 workspace 只承载订单详情 Action。Shopify 要求下面三个 target 各占一个 extension：

- 订单详情 Block：[`admin-ui-logistics-block`](../admin-ui-logistics-block/shopify.extension.toml)，打开订单时展示物流状态。
- 订单详情 Action：本目录，从订单详情页的 More actions 打开 modal，执行一次刷新。
- 订单列表 Selection Action：[`admin-ui-logistics-selection`](../admin-ui-logistics-selection/shopify.extension.toml)，选择多个订单后批量同步，并展示部分失败结果。

## 运行方式

从仓库根目录运行：

```bash
pnpm install
pnpm app:dev
```

Shopify CLI 会读取根目录的 `shopify.app.toml`，并发现三个物流扩展的 `shopify.extension.toml`。Block 安装到开发店铺后，需要在订单详情页通过 App block 设置添加并固定 “Logistics learning block”；Action 和 Selection Action 分别从订单详情页、订单列表页的 More actions 菜单使用。

## 文件导读

| 文件 | 关注点 |
| --- | --- |
| `shopify.extension.toml` | 订单详情 Action 的 API 版本、handle 与入口模块 |
| `src/shared/context.ts` | 从 `shopify.data.selected` 读取 Shopify 提供的资源 ID |
| `src/shared/logistics.ts` | 可替换的确定性 mock；生产环境替换为业务 API adapter |
| `../admin-ui-logistics-block/src/order-details-block.tsx` | 轻量只读展示、加载、刷新、错误状态 |
| `src/order-details-action.tsx` | `s-admin-action` modal、主次操作、`shopify.close()` |
| `../admin-ui-logistics-selection/src/order-index-selection-action.tsx` | 多选资源、批量执行、成功/失败汇总 |

## Mock 与真实后端的边界

当前 `shared/logistics.ts` 不访问真实物流服务，只根据订单 ID 产生稳定的演示结果。生产替换时，extension 可以请求同域 App backend：

```ts
const response = await fetch(`/api/logistics/orders/${encodeURIComponent(orderId)}`);
```

Shopify 会在请求到 App URL 或其子域时自动添加 OpenID Connect ID Token；后端必须验证 token、店铺和用户上下文，再调用物流服务。跨域请求才需要通过 `shopify.auth.idToken()` 手动取得 token。不要把 client secret、Admin API token 或物流供应商密钥放进 extension。

更多说明见 [`docs/admin-ui-extensions/`](../../docs/admin-ui-extensions/README.md)。
