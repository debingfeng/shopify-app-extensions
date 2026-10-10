# Checkout UI Extension 学习工程

本目录记录 Checkout UI Extension 的学习 Demo、验证方式和 Shopify 平台限制。

## 本地启动

```bash
pnpm install
pnpm app:dev
```

Shopify CLI 会读取根目录的 `shopify.app.toml`，并加载 `extensions/checkout-ui-learning`、`extensions/order-status-learning` 以及两个 Function 包。
在 Checkout Editor 中把对应 target 放到页面后预览。需要真实测试店铺、Checkout Extensibility 支持和相应的商家权限。

## 技术约定

- API Version：`2026-07`
- Preact + TypeScript
- Polaris Web Components（`s-*` 元素）
- Checkout UI Extension 与 Shopify Functions 分包
- Mock 数据只用于 Backend demo，不伪造 Shopify API
