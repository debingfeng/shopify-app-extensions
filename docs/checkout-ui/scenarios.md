# Checkout 场景验证记录

状态约定：`已实现` 表示源码和类型检查已完成；`待店铺验证` 表示需要在支持对应能力的 Shopify 测试店铺预览；`受限` 表示能力受 target、权限、商家计划或 accelerated checkout 影响。

| Demo | Target | 核心 API | 状态 |
| --- | --- | --- | --- |
| 01 Banner | `purchase.checkout.block.render` | Settings、Localization、Polaris Web Components | 已实现；待店铺验证 |
| 02 Upsell | `purchase.checkout.block.render` | `lines`、`instructions.lines`、`applyCartLinesChange` | 规划中 |
| 03 Discount | `purchase.checkout.block.render` | `discountCodes`、`instructions.discounts`、`applyDiscountCodeChange` | 规划中 |
| 04 Gift Message | `purchase.checkout.block.render` | Attributes、Cart Metafields、`instructions` | 规划中；受权限限制 |
| 05 Shipping | `purchase.checkout.delivery-address.render-after` | `shippingAddress`、`deliveryGroups` | 规划中；受保护客户数据限制 |
| 06 Backend | `purchase.checkout.block.render` | `sessionToken`、`network_access` | 规划中；Mock API |
| 07 Settings | `purchase.checkout.block.render` | `settings`、`localization` | 规划中 |
| 08 Protection | `purchase.checkout.block.render` | Cart Lines、Cart Instructions | 规划中 |
| 09 Buyer | `purchase.checkout.block.render` | `buyerIdentity` | 规划中；受 protected customer data 限制 |
| 10 Validation | Checkout Validation Function | Shopify Functions input/output | 规划中 |
| 11 Thank You / Order Status | `purchase.thank-you.block.render`、`purchase.order-status.block.render` | Order Confirmation API | 规划中；受 target 支持限制 |
| 12 Discount Rules | Discount Function | Shopify Functions input/output | 规划中 |

## Demo 01 验证

- 运行：`pnpm --filter @standhigher/checkout-ui-learning typecheck`
- 预览：运行 `pnpm app:dev`，在 Checkout Editor 添加 `purchase.checkout.block.render`。
- 成功：显示商家配置或默认的双语公告。
- 空配置：使用内置中英文 fallback。
- 限制：商家未启用该 target、扩展未安装或 Checkout Editor 不支持时不会显示；该状态必须以 Shopify CLI/测试店铺结果为准。
