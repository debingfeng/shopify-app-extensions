# 发布检查清单

## 适用范围

本文档用于当前单 App 骨架仓库的测试环境与生产环境发布前检查。Shopify App 配置以仓库 TOML 为唯一配置源：

- `shopify.app.toml`：本地开发 + 测试环境
- `shopify.app.production.toml`：生产环境

Partner Dev Dashboard 只用于首次创建 App、获取基础信息和处理 Shopify 审批事项。日常 `scopes` / `topics` 变更必须通过 Git 修改 TOML，并使用 Shopify CLI 发布。

## Shopify Config Release Checklist

- [ ] `shopify.app.toml` 只用于本地开发和测试发布。
- [ ] `shopify.app.production.toml` 只用于生产发布。
- [ ] 两个 TOML 使用不同的 `client_id`。
- [ ] 产品发布流水线如配置了 `SHOPIFY_TEST_CLIENT_ID`，`shopify.app.toml` 的 `client_id` 与其一致。
- [ ] 产品发布流水线如配置了 `SHOPIFY_PRODUCTION_CLIENT_ID`，`shopify.app.production.toml` 的 `client_id` 与其一致。
- [ ] TOML 不包含 `client_secret`、Admin API Access Token、Refresh Token、店铺级 Token 或生产密钥。
- [ ] `application_url`、`redirect_urls`、`webhooks.uri` 与目标环境一致。
- [ ] `use_legacy_install_flow = false`。
- [ ] 已配置 `app/uninstalled`。
- [ ] 已配置 `app/scopes_update`。
- [ ] `webhooks.api_version` 符合项目统一版本。
- [ ] 新增业务 webhook topic 时，对应 scope 已声明在 `scopes` 或 `optional_scopes`。
- [ ] `pnpm app:config:validate` 已通过。
- [ ] `pnpm app:config:validate:production` 已通过。
- [ ] `pnpm app:config:guard` 已通过。
- [ ] `pnpm check` 已通过。
- [ ] 测试店铺安装和重新授权行为已验证。
- [ ] `app/uninstalled` 和 `app/scopes_update` 已到达目标后端。
- [ ] 生产发布已通过 PR Review。

## 发布前必查项

### 1. 代码与构建

- 执行 `pnpm check`
- 执行 `pnpm build`
- 确认 `apps/admin/dist/server.js` 已生成
- 确认工作区无未提交的临时改动

### 2. Shopify 配置

- 执行 `pnpm app:config:validate`
- 执行 `pnpm app:config:validate:production`
- 执行 `pnpm app:config:guard`
- 核对 `shopify.app.toml` 只绑定 Dev/Test Shopify App
- 核对 `shopify.app.production.toml` 只绑定 Production Shopify App
- 核对两个 TOML 的 `client_id` 不同
- 核对 `application_url`
- 核对 `auth.redirect_urls`
- 核对 `access_scopes.scopes`
- 核对 `access_scopes.optional_scopes`
- 核对 `access_scopes.use_legacy_install_flow = false`
- 核对 `embedded = true`
- 核对 `[build] include_config_on_deploy = true`
- 核对开发配置允许本地更新 URL，生产配置禁止自动更新 URL

### 3. Webhook

必须确认以下 App 生命周期 topic 已声明：

- `app/uninstalled`
- `app/scopes_update`

同时确认：

- `webhooks.api_version` 符合项目统一版本
- 测试 TOML 的 `webhooks.uri` 指向测试后端
- 生产 TOML 的 `webhooks.uri` 指向生产后端
- 后端已完成 HMAC 校验
- webhook 可稳定返回 `2xx`
- 新增业务 topic 时，已确认所需 scope 已声明

### 4. 环境边界

- 本地开发配置未覆盖测试环境
- 测试环境与生产环境使用不同 Shopify App
- 未在共享配置上直接运行 `pnpm app:dev`
- 测试环境直连测试业务后端，未使用 `/dev-proxy`
- 生产环境直连生产业务后端，未使用 `/dev-proxy`
- 生产 TOML 不包含测试域名、本地 tunnel、`localhost` 或 `127.0.0.1`
- 测试 TOML 不绑定生产 `client_id`

### 5. 前端运行时配置

- `.env.local`、测试环境变量、生产环境变量字段一致
- `public/conf/config.json` 与环境变量约定一致
- `SHOPIFY_API_KEY`
- `BACKEND_API_BASE`
- `PLATFORM_API_BASE`
- `APP_NAME`
- `APP_ORIGINS`
- 测试 / 生产环境的 `BACKEND_API_BASE` 不以 `/dev-proxy` 开头

### 6. admin 应用回归

- `/{locale}` 首页可正常访问
- `/{locale}/settings` 可正常访问
- `/{locale}/help` 可正常访问
- `host` / `shop` 参数能正常传递
- App Bridge 正常注入
- 页面内跳转不会丢失嵌入上下文

## 推荐发布顺序

1. 根目录执行 `pnpm check`
2. 根目录执行 `pnpm build`
3. 执行 `pnpm app:config:validate`
4. 执行 `pnpm app:config:guard`
5. 执行 `pnpm app:deploy:test`
6. 使用测试店铺完成授权、Webhook 和 admin 应用回归
7. 修改并 Review `shopify.app.production.toml`
8. 执行 `pnpm app:config:validate:production`
9. 执行 `pnpm app:config:guard`
10. 执行 `pnpm app:deploy:production`
11. 观察线上监控

## 测试环境验收

- 新安装店铺授权范围与 `shopify.app.toml` 一致
- 新增必选 scope 后，已有测试店铺能触发授权提示
- 减少 scope 后，权限能正确收口
- `app/scopes_update` 能正常到达测试后端
- `app/uninstalled` 能正常到达测试后端
- 业务 Webhook 能正常投递
- 前端不依赖运营平台返回的 `scopes` / `topics`

## 生产发布要求

- 必须经过 PR Review
- 必须通过 `pnpm check`
- 必须确认 `application_url`、`redirect_urls`、`webhooks.uri` 均为生产地址
- 必须确认 `client_id` 为生产 Shopify App
- 必须确认 `scopes`、`optional_scopes`、`webhooks` 是预期变更

## 回滚与监控

生产配置发布异常时：

1. 回滚 Git 中的 `shopify.app.production.toml`
2. 执行 `pnpm app:config:validate:production`
3. 执行 `pnpm app:config:guard`
4. 执行 `pnpm app:deploy:production`
5. 验证新安装授权范围、已安装店铺权限状态、Webhook 投递、App 打开和后端 Token Exchange

配置发布后重点监控：

- App 打开失败率
- Token Exchange 失败率
- Admin API 401 / 403
- Webhook 2xx 成功率
- `app/uninstalled` 处理成功率
- `app/scopes_update` 处理成功率

## 备注

当前 `build:extensions` 在没有 extension workspace 时输出 `No projects matched` 属于预期，不构成发布阻塞。
