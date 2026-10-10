# App Bridge 能力验证清单

本文档用于记录 `apps/admin` 当前已接入或建议验证的 App Bridge 能力。

## 使用前提

- 页面必须运行在 Shopify Admin iframe 内
- URL 需要带 `host`
- `window.shopify` 必须存在

## 1. Runtime 注入

目标：

- 确认 Shopify App Bridge runtime 已成功加载

检查位置：

- `pages/_document.tsx`

验证点：

- `<meta name="shopify-api-key" />` 已注入
- `app-bridge.js` 已加载
- `window.shopify` 可用

## 2. Provider 装配

目标：

- 确认应用只存在一套 App Bridge Provider 链

检查位置：

- `components/EmbeddedAppShell.client.tsx`

验证点：

- 不重复包裹 Provider
- 页面无 hydration 报错
- 页面无 Provider 冲突

## 3. Toast

目标：

- 确认前端可以触发 Shopify Admin Toast

成功标志：

- Admin 底部出现 Toast

## 4. Save Bar

目标：

- 确认脏表单提示可展示与关闭

成功标志：

- 顶部出现 Shopify Save Bar
- 点击保存或取消可关闭

## 5. Resource Picker

目标：

- 确认商品或集合选择器可正常打开

成功标志：

- 打开 Shopify 原生选择器
- 能返回选中结果

## 6. Navigation

目标：

- 确认应用内跳转不会丢失嵌入上下文

成功标志：

- 应用内跳转仍停留在 iframe 中
- `host` / `shop` 参数未丢失
- 不会意外新开标签页

## 7. Modal

目标：

- 确认 Shopify 原生 Modal 可正常展示和关闭

成功标志：

- Modal 正常弹出
- 确认和取消操作可关闭

## 8. Title Bar

目标：

- 确认标题栏标题与 CTA 可正常更新

成功标志：

- Shopify Admin 顶部标题栏变化正确
- CTA 点击可触发对应逻辑

## 9. Session Token

目标：

- 确认 `shopify.idToken()` 链路可正常工作

成功标志：

- 前端能获取 token
- 请求头中可带 `Authorization: Bearer <token>`

## 常见问题排查

### `window.shopify` 为 `undefined`

可能原因：

- 不在 Shopify Admin iframe 中
- runtime 未注入
- `host` 缺失

### `ui-*` 组件不可用

可能原因：

- App Bridge runtime 未加载成功
- 当前页面不在嵌入式上下文中
