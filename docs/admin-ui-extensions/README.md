# Shopify Admin UI Extension 学习与开发手册

这套材料以当前仓库的 `extensions/admin-ui-logistics-demo` 为主线，帮助同事理解 Shopify Admin UI Extension 的运行模型，并能从订单物流场景开始开发自己的 Block、Action 和 Selection Action。

## 先看什么

推荐阅读顺序：

1. [学习路线](./01-learning-roadmap.md)：先建立概念和官方资料索引。
2. [运行模型与 Target](./02-runtime-and-targets.md)：理解扩展在 Shopify Admin 中出现在哪里、能拿到什么 API。
3. [数据、认证与后端](./03-data-auth-and-backend.md)：决定什么时候用 `shopify.query()`，什么时候调用自己的 backend。
4. [本地开发与发布](./04-local-development-and-release.md)：完成开发店铺调试、Block 固定和部署检查。
5. [Demo 逐文件导读](./05-demo-walkthrough.md)：按 Block → Action → Selection Action 讲解代码。

## 本仓库 Demo

```text
extensions/admin-ui-logistics-block/
  shopify.extension.toml
  src/order-details-block.tsx
extensions/admin-ui-logistics-demo/
  shopify.extension.toml
  src/order-details-action.tsx
extensions/admin-ui-logistics-selection/
  shopify.extension.toml
  src/order-index-selection-action.tsx
```

Demo 的 mock 只用于学习 UI、上下文和状态管理。真实业务需要由 App backend 负责鉴权、权限判断、持久化和第三方物流调用。

## 官方资料

- [Admin UI extensions overview](https://shopify.dev/docs/api/admin-extensions/latest)
- [Targets reference](https://shopify.dev/docs/api/admin-extensions/latest/targets)
- [Target APIs reference](https://shopify.dev/docs/api/admin-extensions/latest/target-apis)
- [Web components reference](https://shopify.dev/docs/api/admin-extensions/latest/web-components)
- [Build an admin action UI extension](https://shopify.dev/docs/apps/build/admin/actions-blocks/build-admin-action)
- [Shopify official Preact example](https://github.com/Shopify/example-admin-action-and-block-preact)

文档和 demo 以 Admin UI Extension API version `2026-07` 为基线。Shopify CLI 生成的实际配置和当前可用 target 以开发时 CLI 校验结果为准。
