# 物流三件套 Demo 逐文件导读

## 1. 配置入口

打开 [`shopify.extension.toml`](../../extensions/admin-ui-logistics-demo/shopify.extension.toml)，先看三个 targeting。配置只声明“在哪里出现”和“哪个模块负责”，业务逻辑在 TSX 中。

## 2. 共享上下文

[`src/shared/context.ts`](../../extensions/admin-ui-logistics-demo/src/shared/context.ts) 只有两个函数：

- `getSelectedIds()`：适合 Selection Action。
- `getFirstSelectedId()`：适合详情 Block/Action。

这个边界让入口文件不需要知道 Shopify 当前页面的 URL 或 DOM 结构。

## 3. Block：先读后显

[`src/order-details-block.tsx`](../../extensions/admin-ui-logistics-demo/src/order-details-block.tsx) 展示最常见的 Block 模式：

1. 取当前订单 ID。
2. 显示加载状态。
3. 调用 `getShipment()`。
4. 用 `s-badge`、`s-text` 展示结果。
5. 用按钮重复加载。

讲解重点是“上下文内只显示足够的信息”。如果需要完整轨迹，应由按钮导航到 Embedded App 或打开更完整的 Action。

## 4. Action：modal 内完成一次操作

[`src/order-details-action.tsx`](../../extensions/admin-ui-logistics-demo/src/order-details-action.tsx) 展示：

- `s-admin-action` 的 `heading`。
- `primary-action` 和 `secondary-actions` slot。
- 提交中禁用主按钮。
- 成功后 `shopify.close()`。
- 失败时保留 modal，方便重试或查看原因。

换成真实业务时，`syncShipments([orderId])` 应改成调用 backend 的 API；backend 负责 token、权限和物流服务调用。

## 5. Selection Action：批量结果不能只返回一个布尔值

[`src/order-index-selection-action.tsx`](../../extensions/admin-ui-logistics-demo/src/order-index-selection-action.tsx) 把结果拆成 `succeeded` 和 `failed`。这是批处理的最低可用反馈：

- 商家知道处理了多少条。
- 商家知道哪些订单失败。
- 部分失败时 modal 保持打开，不会误导商家以为全部成功。

生产实现还应增加后端任务 ID、进度查询和重试策略，避免在 modal 中等待很长时间。

## 6. 演示顺序

1. 先用 Block 说明“详情页上下文”。
2. 点 Action 说明“modal 和一次性操作”。
3. 到订单列表选择多条，说明 Selection Action 的数组上下文。
4. 打开 `shared/logistics.ts`，指出 mock 与真实 backend 的替换点。
5. 最后打开 [数据、认证与后端](./03-data-auth-and-backend.md)，说明为什么 secret 和复杂业务不能放在 extension。
