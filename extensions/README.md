# extensions 目录说明

该目录用于放置当前 Shopify App 的扩展项目。

当前已有：

- `admin-ui-logistics-block/`：订单详情 Block
- `admin-ui-logistics-demo/`：订单详情 Action
- `admin-ui-logistics-selection/`：订单列表 Selection Action
- `checkout-ui-learning/`
- `checkout-validation-function/`
- `discount-rules-function/`
- `order-status-learning/`
- `theme-product-note/`：商品页 Theme App Block

约定：

- 每个扩展保持独立目录
- 扩展构建与发布脚本统一由仓库根脚本编排
- Admin UI 学习 demo 的技术说明见 `docs/admin-ui-extensions/`
- 当前 workspace 的 `build` 先执行类型检查；实际 Shopify bundle 由 `shopify app dev` / `shopify app deploy` 编排
- Checkout UI 学习工程说明见 `docs/checkout-ui/`
- `order-status-learning/` 是 Demo 11 的 Customer Account Order Status 独立扩展；Checkout UI 包只承载 Thank You target。
