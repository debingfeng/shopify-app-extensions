# Sidekick：搜索 Lab 演示目录

`extensions/sidekick-demo-search` 提供一个只读的 `admin.app.tools.data` 工具 `search_lab_demos`。它在 Shopify 扩展沙箱内搜索随扩展打包的少量演示条目，返回 `app:` 链接，供商家打开已有的 npm 包或 Extension 指南页面。没有后端请求、店铺数据读取或写入动作。

## 本地验证

1. 运行 `pnpm --filter @standhigher/sidekick-demo-search test` 验证关键词与 App 链接。
2. 运行 `pnpm app:dev`，确认扩展构建成功。Admin 内的指南页面并非 Sidekick 实际运行环境。
3. 在已安装此 App 且支持 Sidekick 扩展的测试店铺，向 Sidekick 询问 “Find the charts demo in Standhigher Lab”，检查工具返回的页面链接。中文可询问“查找 Web Pixel 演示”。

本示例只使用扩展内的静态目录。新增演示时需要同步维护 `src/index.js` 中的简短索引；如果将来改为查询 App 后端，应按 Shopify 要求增加 token exchange、鉴权和 `https://extensions.shopifycdn.com` 的 CORS 配置。当前店铺尚未安装 App，Sidekick 调用与跳转仍待真实店铺验证。
