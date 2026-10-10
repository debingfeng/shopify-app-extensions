# Shopify 配置发布说明

## 配置原则

Shopify App 配置以 App 仓库中的 TOML 文件为唯一配置源。

Partner Dev Dashboard 仅用于：

- 首次创建 Shopify App
- 获取 `client_id` / App 基础信息
- 申请受保护权限或处理 Shopify 审批事项

日常配置不再通过 Partner Dev Dashboard 修改，也不再通过运营平台维护 `scopes` / `topics`。

## 配置文件约定

项目只维护两个 Shopify 配置文件：

| 文件 | 用途 | 绑定对象 |
| --- | --- | --- |
| `shopify.app.toml` | 本地开发 + 测试环境 | Dev/Test Shopify App |
| `shopify.app.production.toml` | 生产环境 | Production Shopify App |

`shopify.app.toml` 是默认配置，本地开发和测试发布都使用它。`shopify.app.production.toml` 只用于生产发布。

两个文件必须绑定不同的 Shopify App，避免测试配置影响线上商家。

当前学习模板的开发配置绑定 Shopify App：`b619d8b384633280bb72ad2004be8993`。如果后续切换到其他 Dev/Test App，需要将 `shopify.app.toml` 中的 `client_id` 替换为对应 App 的 ID。

生产 `client_id`、域名和 webhook 地址仍是占位示例。接入具体 App 时，需要先替换为真实 Production Shopify App 信息，再执行 Shopify CLI 原生校验和 deploy。作为产品矩阵模板，具体产品仓库或发布流水线可以通过环境变量开启真实 `client_id` 精确校验。

## 配置内容

两个 TOML 都应维护以下核心配置：

- `name`
- `client_id`
- `application_url`
- `embedded = true`
- `[build] include_config_on_deploy = true`
- `[build] automatically_update_urls_on_dev`（默认配置可为 `true`，生产配置必须为 `false`）
- `[access_scopes] scopes`
- `[access_scopes] optional_scopes`
- `[access_scopes] use_legacy_install_flow = false`
- `[auth] redirect_urls`
- `[webhooks] api_version`
- `app/uninstalled`
- `app/scopes_update`

环境差异主要体现在：

| 配置项 | 本地/测试 | 生产 |
| --- | --- | --- |
| `client_id` | 测试 App Client ID | 生产 App Client ID |
| `name` | 测试 App 名称 | 生产 App 名称 |
| `application_url` | 本地 tunnel 或测试域名 | 生产域名 |
| `redirect_urls` | 本地/测试回调地址 | 生产回调地址 |
| `webhooks.uri` | 测试后端地址 | 生产后端地址 |

以下内容禁止写入 TOML：

- `client_secret`
- Admin API Access Token
- Refresh Token
- 店铺级 Token
- 生产密钥

## 本地开发流程

本地开发默认使用 `shopify.app.toml`。

```bash
pnpm app:config:validate
pnpm app:dev
```

本地代理业务后端 API 时，浏览器侧 `BACKEND_API_BASE` 可以配置为 `/dev-proxy/proxy/api`。该路径只允许用于本地开发，测试和生产环境必须配置真实业务后端 URL。

本地开发关注点：

- App 能否正常嵌入 Shopify Admin
- App Bridge 是否能获取 Session Token
- 前端请求后端是否携带 `Authorization: Bearer <session_token>`
- 后端是否能完成 Session Token 校验和 Token Exchange
- 权限不足、401、403、重新授权等状态是否展示正确

`shopify.app.toml` 默认允许 Shopify CLI 自动更新 URL，方便固定开发 App 在本地开箱运行：

```toml
[build]
automatically_update_urls_on_dev = true
```

测试发布前必须确认当前配置指向测试域名，避免测试配置被个人本地 tunnel 地址污染。生产配置始终保持 `automatically_update_urls_on_dev = false`。

## 测试环境发布流程

测试环境也使用 `shopify.app.toml`。

发布前校验：

```bash
pnpm app:config:validate
pnpm app:config:guard
```

对应 Shopify CLI 原生命令：

```bash
shopify app config validate --json
```

部署到测试 Shopify App：

```bash
pnpm app:deploy:test
```

测试验收内容：

- 新安装店铺授权范围与 `shopify.app.toml` 一致
- 测试运行配置直连测试业务后端，未使用 `/dev-proxy`
- 新增必选 scope 后，已有测试店铺能触发授权提示
- 减少 scope 后，权限能正确收口
- `app/scopes_update` 能正常到达测试后端
- `app/uninstalled` 能正常到达测试后端
- 业务 Webhook 能正常投递
- 前端不再依赖运营平台返回的 `scopes` / `topics`

## 生产配置发布流程

生产环境只使用 `shopify.app.production.toml`。

生产发布前校验：

```bash
pnpm app:config:validate:production
pnpm app:config:guard
```

对应 Shopify CLI 原生命令：

```bash
shopify app config validate --config production --json
```

生产发布：

```bash
pnpm app:deploy:production
```

生产发布要求：

- 必须经过 PR Review
- 必须通过 `pnpm check`
- 必须确认 `application_url`、`redirect_urls`、`webhooks.uri` 均为生产地址
- 必须确认 `BACKEND_API_BASE`、`NEXT_PUBLIC_BACKEND_API_BASE` 和 `public/conf/config.json` 未使用 `/dev-proxy`
- 必须确认 `client_id` 为生产 Shopify App
- 必须确认 `scopes`、`optional_scopes`、`webhooks` 是预期变更

## 自定义校验规则

`pnpm app:config:guard` 会检查项目约束：

- `shopify.app.production.toml` 不允许出现测试域名
- `shopify.app.toml` 不允许绑定生产 `client_id`
- `shopify.app.toml` 和 `shopify.app.production.toml` 必须绑定不同的 `client_id`
- `use_legacy_install_flow` 不允许为 `true`
- 必须配置 `app/uninstalled`
- 必须配置 `app/scopes_update`
- `webhooks.api_version` 必须符合项目统一版本
- Webhook URI 可通过环境变量约束对应环境后端
- 已知业务 topic 会校验所需 scope，例如 `orders/create` 需要 `read_orders` 或 `write_orders`

admin 运行时也会检查业务后端地址：非 `development` 环境下，`BACKEND_API_BASE` 或运行时 `public/conf/config.json` 中的 `BACKEND_API_BASE` 不能以 `/dev-proxy` 开头。

可选环境变量：

| 变量 | 说明 |
| --- | --- |
| `SHOPIFY_WEBHOOK_API_VERSION` | 覆盖默认 Webhook API 版本，默认 `2026-04` |
| `SHOPIFY_TEST_CLIENT_ID` | 可选；要求 `shopify.app.toml` 的 `client_id` 精确匹配测试 Shopify App |
| `SHOPIFY_PRODUCTION_CLIENT_ID` | 可选；要求 `shopify.app.production.toml` 的 `client_id` 精确匹配生产 Shopify App，并防止测试配置误用生产 App |
| `SHOPIFY_TEST_WEBHOOK_HOST` | 要求测试 Webhook URI 的 hostname 精确匹配指定 host |
| `SHOPIFY_PRODUCTION_WEBHOOK_HOST` | 要求生产 Webhook URI 的 hostname 精确匹配指定 host |

## 推荐发布顺序

```text
本地开发验证
→ shopify.app.toml 校验
→ 测试环境 deploy
→ 测试店铺验收
→ 修改 shopify.app.production.toml
→ PR Review
→ 生产配置校验
→ production deploy
→ 线上监控
```

## 回滚策略

如果生产配置发布异常：

1. 回滚 Git 中的 `shopify.app.production.toml`
2. 重新执行：

```bash
pnpm app:deploy:production
```

3. 验证：
   - 新安装授权范围
   - 已安装店铺权限状态
   - Webhook 投递
   - 前端打开 App 是否正常
   - 后端 401/403/Token Exchange 错误是否恢复

配置发布后应重点监控：

- App 打开失败率
- Token Exchange 失败率
- Admin API 401 / 403
- Webhook 2xx 成功率
- `app/uninstalled` 处理成功率
- `app/scopes_update` 处理成功率

## 验收标准

- 本地/测试只使用 `shopify.app.toml`
- 生产只使用 `shopify.app.production.toml`
- Partner Dev Dashboard 不再作为日常配置源
- 运营平台不再维护 `scopes` / `topics`
- 配置变更可通过 Git 追踪
- 配置发布通过 Shopify CLI 完成
- 开发、测试、生产环境互不污染
