# Shopify Flow Action：确认备注

`extensions/flow-acknowledge` 提供一个最小 `flow_action`，商家在 Flow 中填写一段短备注。Flow 运行时向 App 的 `/api/lab/flow-acknowledge` 发送签名 POST。服务端先用 `SHOPIFY_API_SECRET` 验证原始请求体的 HMAC，再检查 action handle、店铺域名、运行 ID 和备注长度，最后返回 200。示例不保存备注，不调用 Admin API；重复投递没有业务副作用。

## 本地与店铺验证

1. 为 Admin 服务端配置开发 App 的 `SHOPIFY_API_SECRET`。仅放在本地环境或部署环境，**不要提交到仓库**。
2. 确认开发 App 与 Shopify Flow 均已安装到测试店铺。自定义 App 的 Flow 任务在 Shopify Plus 店铺或 Plus 开发店铺可用，普通开发店铺可能无法添加此 Action。
3. 运行 `pnpm app:dev`，在 Flow 编辑器创建测试工作流并添加 **Lab acknowledge note**，填写 Note。
4. 触发工作流，检查 Flow 运行日志中的 Action 成功状态，以及 Admin 服务端日志中的 `runId` 与 `shop`。日志不会包含备注或签名。
5. 分别测试错误签名、错误 handle、空备注；接口应返回 401 或 400，且不记录成功日志。

`runtime_url` 使用相对路径，CLI 预览时由当前 App tunnel 提供 HTTPS 地址。Admin 实验室页面只是说明，Action 实际由 Shopify Flow 调用。源码与本地构建已验证；测试店铺中的工作流执行仍待 App 安装及店铺计划确认。
