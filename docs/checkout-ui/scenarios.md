# Checkout 场景验证记录

状态约定：`已实现` 表示源码和类型检查已完成；`待店铺验证` 表示需要在支持对应能力的 Shopify 测试店铺预览；`受限` 表示能力受 target、权限、商家计划或 accelerated checkout 影响。

| Demo | Target | 核心 API | 状态 |
| --- | --- | --- | --- |
| 01 Banner | `purchase.checkout.block.render` | Settings、Localization、Polaris Web Components | 已实现；待店铺验证 |
| 02 Upsell | `purchase.checkout.cart-line-list.render-after` | `lines`、`instructions.lines`、`applyCartLinesChange` | 已实现；待店铺验证 |
| 03 Discount | `purchase.checkout.block.render` | `discountCodes`、`instructions.discounts`、`applyDiscountCodeChange` | 已实现；待店铺验证 |
| 04 Gift Message | `purchase.checkout.contact.render-after` | Attributes、Cart Metafields、`instructions` | 已实现；待店铺验证；受权限限制 |
| 05 Shipping | `purchase.checkout.delivery-address.render-after` | `shippingAddress`、`deliveryGroups` | 已实现；待店铺验证；受保护客户数据限制 |
| 06 Backend | `purchase.checkout.payment-method-list.render-after` | `sessionToken`、`network_access` | 已实现；待店铺验证；Mock API |
| 07 Settings | `purchase.checkout.header.render-after` | `settings`、`localization` | 已实现；待店铺验证 |
| 08 Protection | `purchase.checkout.reductions.render-after` | Cart Lines、Cart Instructions | 已实现；待店铺验证 |
| 09 Buyer | `purchase.checkout.footer.render-after` | `buyerIdentity` | 已实现；待店铺验证；受 protected customer data 限制 |
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

## Demo 05 Shipping 验证

- 运行：在 Checkout Editor 预览 `purchase.checkout.delivery-address.render-after`，分别测试数字商品、实体商品和未填写地址。
- 成功：读取真实 shipping address、delivery groups、delivery options 与 selected option。
- 空状态：地址未提交或 Shopify 尚未计算配送费时显示等待状态。
- 限制：Shipping address 属于 protected customer data；target、权限、数字商品和加速结账可能导致字段或配送组不可用。

## Demo 06 Backend 验证

- 运行：启动 `pnpm dev:proxy` 与 `pnpm app:dev`，在 Checkout Editor 预览对应 target，点击 Call mock API。
- 成功：扩展调用 `sessionToken.get()`，向 `/proxy/checkout-learning/session` 发送 Bearer token，Mock API 返回成功消息。
- 失败：Mock API 在缺少 token、非 POST 或非 JSON 请求时返回错误；扩展显示 error 状态。
- 限制：本地 Mock API 只验证 token header 存在，不验证 Shopify JWT 签名；生产后端必须按 Shopify 官方 session token 文档校验 issuer、audience、exp 等 claims。网络访问能力还受扩展配置和商店预览环境影响。

## Demo 07 Settings 验证

- 运行：在 Checkout Editor 为 `settings_title` 和 `settings_message` 填值，预览 `purchase.checkout.header.render-after`。
- 成功：扩展读取 merchant settings 并显示当前 Checkout language。
- 空状态：编辑器尚未设置字段时显示中英文 fallback 与说明。
- 限制：settings 为空是编辑器初始状态；语言只反映 Shopify 提供的 locale，未配置语言仍使用代码内 fallback。

## Demo 08 Protection 验证

- 运行：配置 `protection_variant_id` 为可销售变体，预览 reductions target。
- 成功：开关通过 `applyCartLinesChange` 幂等添加/删除保障商品，重复点击不会重复添加。
- 失败/限制：无效变体、库存或 Cart Instructions 禁止写操作时显示错误或禁用按钮。

## Demo 09 Buyer 验证

- 运行：在已登录与匿名买家 checkout 各预览一次。
- 成功：只展示 Shopify 暴露的 email/customer ID。
- 限制：缺少 protected customer data 权限时显示不可用；匿名买家没有客户字段属于正常状态。
