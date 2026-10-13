# Web Pixel：页面浏览事件

`extensions/lab-web-pixel` 是一个最小 Web Pixel：在 Shopify 的 strict sandbox 中订阅 `page_viewed`，仅在浏览器开发者工具输出事件名称与本地计数；不读取事件中的顾客资料，不设置 Cookie，也不发送网络请求。隐私声明要求 analytics 同意，不要求 marketing 或 preferences，同样不涉及数据销售。

## 启用与验证

1. 在开发店铺安装此 App，并使其拥有 `write_pixels`、`read_customer_events` scope；更新 scope 后可能需要重新授权。店铺还需启用 Customer events 能力。
2. 运行 `pnpm app:dev`，确认 Web Pixel 扩展成功构建。仅启动 CLI 不会自动创建店铺的 Web Pixel 记录。
3. 使用已认证的 Admin GraphQL API 执行 `webPixelCreate`，将 `settings` 设为 `{"demoLabel":"standhigher-lab"}`。可使用 CLI 提供的本地 GraphiQL；如记录已存在，则查询 `webPixel` 而不是重复创建。
4. 在 Shopify Admin 的 **Settings → Customer events** 中确认 App pixel 为 Connected。在测试店铺前台打开页面，并在满足 analytics 同意的状态下检查开发者工具 Console 中的 `[standhigher-lab-pixel] page_viewed`。拒绝 analytics 同意时不应加载该 Pixel。

示例 GraphQL mutation：

```graphql
mutation {
  webPixelCreate(webPixel: {settings: "{\"demoLabel\":\"standhigher-lab\"}"}) {
    userErrors { field message code }
    webPixel { id settings }
  }
}
```

Admin 实验室页面只提供说明；Pixel 实际运行在 Shopify 的隔离沙箱。源码与本地打包可独立验证，店铺连接、同意状态和事件触发仍待测试店铺安装 App 后验证。
