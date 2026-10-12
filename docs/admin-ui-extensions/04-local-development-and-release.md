# 本地开发、调试与发布

## 1. 配置开发 App

根目录 `shopify.app.toml` 是本地开发和测试配置。它应绑定开发/测试 App 的 client ID；生产配置使用独立的 `shopify.app.production.toml`。当前仓库的开发 client ID 应与团队确认的开发 App 保持一致。

先检查配置：

```bash
pnpm app:config:validate
pnpm app:config:guard
```

再启动 Shopify CLI：

```bash
pnpm app:dev
```

不要直接裸开 `localhost:3000` 作为主要联调入口，嵌入式 Admin 场景应从 Shopify Admin 的开发店铺入口打开。

## 2. 验证三个入口

### Block

1. 打开开发店铺的订单详情页。
2. 进入 App blocks 或页面编辑入口。
3. 添加并固定“Logistics learning block”。
4. 确认订单 ID、状态、运单号和刷新按钮出现。

### Action

1. 在订单详情页打开 More actions。
2. 选择“刷新物流（教学 Demo）”。
3. 检查 modal 标题、主操作、取消和错误状态。
4. 点击确认后确认 modal 关闭；模拟失败时确认错误仍留在 modal。

### Selection Action

1. 打开订单列表。
2. 选择两条或更多订单。
3. 在批量操作菜单中打开“批量同步物流（教学 Demo）”。
4. 检查成功/失败汇总和部分失败明细。

## 3. 常见故障

| 现象 | 排查 |
| --- | --- |
| Block 不出现 | 确认已添加并固定 “Logistics learning block”；确认 `admin.order-details.block.render` 在独立 extension 中 |
| dev preview 报 Invalid extension point(s) | Block、订单详情 Action、订单列表 Selection Action 必须各占一个 extension，每个 `shopify.extension.toml` 只保留一个 target |
| Action 不在菜单 | 确认当前页面是订单详情；检查 target、handle 和 CLI 输出 |
| Selection Action 不出现 | 确认已选择订单；检查 target 是 `admin.order-index.selection-action.render` |
| `selected` 为空 | 检查是否在正确页面/target；不要用 URL 解析替代上下文 API |
| 请求 401/403 | 检查 App URL、ID Token 验证、资源归属和 access scopes |
| 修改 handle 后产生重复扩展 | handle/uid 是稳定身份，创建或部署后不要随意修改 |
| 组件类型报错 | 更新 `@shopify/ui-extensions` 和 `shopify.d.ts`，以同一 API 版本生成类型 |

## 4. 发布检查清单

- `shopify.extension.toml` 的 API 版本、target 和模块路径通过 Shopify CLI 校验。
- 开发与生产 App 使用不同 client ID。
- 生产 TOML 不含 `client_secret`、Admin API token、refresh token 或店铺 token。
- 后端验证 ID Token，并校验 shop/user 与资源的关系。
- Block 已在目标页面验证固定行为。
- Action/Selection Action 验证加载、错误、部分失败和重复点击。
- 对第三方物流调用设置超时、重试、幂等键和日志脱敏。
- 部署后记录扩展 version，发现问题时回滚到已验证版本。
