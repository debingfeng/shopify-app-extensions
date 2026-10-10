# Checkout 场景验证记录

状态约定：`已实现` 表示源码和类型检查已完成；`待店铺验证` 表示需要在支持对应能力的 Shopify 测试店铺预览；`受限` 表示能力受 target、权限、商家计划或 accelerated checkout 影响。

| Demo | Target | 核心 API | 状态 |
| --- | --- | --- | --- |
| 01 Banner | `purchase.checkout.block.render` | Settings、Localization、Polaris Web Components | 已实现；待店铺验证 |
| 02 Upsell | `purchase.checkout.cart-line-list.render-after` | `lines`、`instructions.lines`、`applyCartLinesChange` | 已实现；待店铺验证 |
| 03 Discount | `purchase.checkout.block.render` | `discountCodes`、`instructions.discounts`、`applyDiscountCodeChange` | 已实现；待店铺验证 |
| 04 Gift Message | `purchase.checkout.contact.render-after` | Attributes、Cart Metafields、`instructions` | 已实现；待店铺验证；受权限限制 |
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

## Demo 02 Upsell 验证

- 运行：在 Checkout Editor 设置 `upsell_variant_id` 为可销售的 ProductVariant GID，预览 `purchase.checkout.cart-line-list.render-after`。
- 成功：点击 Add upsell 后出现购物车行，点击 Remove upsell 后删除；操作结果由 `applyCartLinesChange` 决定。
- 失败：无效变体、库存不足或 Shopify 返回错误时显示错误提示。
- 限制：当 `instructions.lines.canAddCartLine` 或 `canRemoveCartLine` 为 false 时禁用对应操作；加速结账也可能拒绝写入。实际店铺预览待验证。

## Demo 03 Discount 验证

- 运行：在 Checkout Editor 预览 `purchase.checkout.block.render`，输入真实可用折扣码。
- 成功：`Apply code` 调用 `applyDiscountCodeChange`，已应用的 code 可移除。
- 失败：Shopify 返回的无效、过期或不适用原因显示为错误状态。
- 限制：`instructions.discounts.canUpdateDiscountCodes` 为 false 时所有写操作禁用；加速结账与商家配置可能限制折扣更新。

## Demo 04 Gift Message 验证

- 运行：在 Checkout Editor 预览 `purchase.checkout.contact.render-after`，输入文本并保存。
- 成功：属性能力可用时调用 `applyAttributeChange`；Metafield 能力也可用时再调用 `applyMetafieldChange`。
- 失败：任一 Shopify 写操作返回 error 时显示错误状态。
- 限制：Attributes、Cart Metafields 由 `instructions` 与 checkout/商家权限控制；accelerated checkout 可能拒绝写入，测试店铺结果需要单独记录。
