# Theme App Extension：商品页说明 Block

`extensions/theme-product-note` 提供一个最小的 Theme App Extension。商家在 Online Store 2.0 主题编辑器的商品模板中添加 **Lab product note**，修改标题和说明文字后，前台商品页展示对应内容。该 Block 不调用后端、Admin API 或 Shopify Storefront API。

## 本地体验

1. 确认 `shopify.app.toml` 关联的是开发 App，且 App 已安装到测试店铺。
2. 安装依赖后在仓库根目录运行 `pnpm app:dev`。
3. 打开测试店铺的 Online Store 2.0 主题编辑器，进入商品模板，在支持 App Block 的区域添加 **Lab product note**。
4. 修改 Heading、Description，并在预览的商品页确认内容与样式；移除 Block 后确认内容不再出现。

此示例的 Liquid 文件在 `blocks/product-note.liquid`，CSS 在 `assets/product-note.css`。它的 schema 使用 `target: "section"`，并限定为 `product` 模板。Admin 实验室只提供说明入口；Block 实际运行在店铺主题中。

本地可运行 `shopify app build` 进行 Theme Check 与打包。主题编辑器预览需 App 安装、可用商品和支持 App Block 的 Online Store 2.0 主题；这些店铺侧结果尚未验证。
