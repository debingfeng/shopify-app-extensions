# Checkout 扩展学习工程

本工程在现有 pnpm monorepo 和 Shopify App 下实现 12 个 Demo。10 个 Checkout/Thank You UI 场景在 `extensions/checkout-ui-learning`；Order Status 位于 `extensions/order-status-learning`；Validation 和 Discount Rules 分别位于两个 Function 包。各场景的 target、API、测试步骤和结果见 [scenarios.md](scenarios.md)。

## 安装与本地预览

1. 使用 Node.js 20+、pnpm 10+ 和 Shopify CLI，准备有 Checkout Extensibility、Customer Account UI Extension 与 Shopify Functions 能力的测试店铺，并确保当前 App 已关联该店铺。
2. 在仓库根目录安装依赖：`pnpm install --frozen-lockfile`。
3. 运行 `pnpm app:config:validate` 检查 App 配置，然后运行 `pnpm app:dev`。CLI 会启动 `apps/admin`、`apps/local-proxy` 与预览 tunnel，并加载四个学习扩展包。单独调试 Mock API 可运行 `pnpm dev:proxy`。
4. 在 Checkout Editor 添加需要的 Checkout/Thank You target；在 Customer Account 编辑器添加 Order Status target。Demo 02、06、08、11 等需要在编辑器填入变体 GID 或 HTTPS URL，详见 [scenarios.md](scenarios.md)。
5. Function 需要在支持的测试店铺部署后创建并启用对应验证或折扣规则。它们由 Shopify 在 Checkout 中执行，UI Extension 无法直接调用。不要把示例折扣启用到生产店铺。

`pnpm app:dev` 可能更新当前开发 App 的 URL；运行前核对根目录 `shopify.app.toml` 关联的测试 App。此仓库不会自动创建可用商品、折扣码、订单、测试店铺权限或商家计划。

## 本地验证

```bash
pnpm typecheck
pnpm test
pnpm build
shopify app config validate --json
shopify app build --no-color
```

截至 2026-10-12：`pnpm typecheck` 与 `pnpm test` 已在本机通过；Discount Rules 的 8 个、Validation 的 2 个、Proxy 的 38 个相关测试通过。`shopify app build` 已实际打包两个学习 UI Extension 和两个 Function；本次最终修改后将再次运行完整构建。**尚未在 Shopify 测试店铺预览或部署**，所有店铺侧结果仍标记为“待店铺验证”。CLI 成功只证明配置和本地打包有效，不能证明商家计划、protected customer data、`network_access` 或 Function 激活条件已获准。

## Backend Demo 说明

在 Checkout Editor 把 `backend_api_url` 设置成 CLI 公网 HTTPS tunnel 的完整 `/proxy/checkout-learning/session` 地址。Mock API 处理 CORS 预检、检查 Bearer header 与 Demo 请求体。它不验证 Shopify Session Token 的 JWT 签名或 claims；用于学习网络请求流程，不能作为生产鉴权实现。

## 技术约定

- Shopify API Version：`2026-07`；Preact + TypeScript；Polaris Web Components（`s-*` 元素）。
- 购物车、折扣、Attributes 和 Metafields 写操作按 Shopify Cart Instructions 与实际能力结果处理。
- 后端仅对 Demo 06 提供 Mock 响应；Shopify 数据只通过真实扩展 API 读取或修改。
