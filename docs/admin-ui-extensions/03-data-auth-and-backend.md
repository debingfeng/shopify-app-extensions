# 数据、认证与后端边界

## 1. 读取 Shopify 当前上下文

所有三个 demo 都从 `shopify.data.selected` 开始：

```ts
const selected = shopify.data.selected;
const orderIds = selected.map(({id}) => id).filter(Boolean);
```

详情 target 通常取第一项；列表 Selection Action 应处理整个数组。资源 ID 由 Shopify 提供，不能假设顺序以外的 URL 结构，也不要通过读取 Admin 页面 DOM 来获取业务数据。

## 2. 直接调用 Shopify GraphQL

`shopify.query(query, options)` 可以调用 GraphQL Admin API，并由 Shopify 按当前用户权限完成认证。适合读取 Shopify 自有资源，例如订单的展示字段：

```ts
const response = await shopify.query<{order: {name: string}}>(
  `#graphql
    query OrderName($id: ID!) {
      order(id: $id) { name }
    }
  `,
  {variables: {id: orderId}},
);
```

使用最小权限范围，处理 `response.errors`，并避免在 Block 加载时请求不需要展示的完整订单对象。

## 3. 调用 App backend

同域请求优先使用相对 URL：

```ts
const response = await fetch(
  `/api/logistics/orders/${encodeURIComponent(orderId)}`,
);
```

当请求发往 App 的 `application_url` 或其子域时，Shopify 会自动附加 OpenID Connect ID Token。backend 需要：

1. 验证 JWT 签名、受众、签发者和过期时间。
2. 从 token 获取 shop/user 上下文，并与请求资源归属核对。
3. 再访问数据库、物流服务或其他内部 API。
4. 对重复请求、超时和第三方错误返回稳定的业务错误格式。

跨域调用时才手动取得 token：

```ts
const token = await shopify.auth.idToken();
const response = await fetch('https://api.example.com/logistics', {
  headers: {Authorization: `Bearer ${token}`},
});
```

不要把 client secret、Admin API access token、refresh token 或物流供应商密钥放进 `shopify.extension.toml`、前端源码或公开环境变量。

## 4. `fetch`、`query` 和 Embedded App 怎么选

| 问题 | 推荐位置 |
| --- | --- |
| 只需要当前订单名称或状态 | `shopify.query()` |
| 需要自己的物流库、ERP 或缓存 | App backend + `fetch()` |
| 需要长耗时批处理、重试和队列 | App backend/worker，Action 只发起任务 |
| 需要完整轨迹、筛选、报表和配置 | Embedded App |
| 需要跳转到另一个 Shopify Admin 资源 | `shopify.navigation.navigate()` |

## 5. 错误、加载和幂等

每个 target 都应有：

- 初始加载状态：不要在空白区域停留。
- 空上下文状态：`selected` 为空时给出明确提示。
- 可理解的错误状态：区分网络错误、权限错误、业务拒绝和部分失败。
- 重复点击保护：请求进行中禁用主按钮。
- 幂等操作：刷新/同步接口用 request ID 或资源状态避免重复副作用。
- 超时和重试策略：不要让 modal 无限等待。

Selection Action 不能因为一个订单失败就丢弃整体结果。返回每个订单的成功或失败，并让商家知道是否需要重试。
