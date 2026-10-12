# Shopify App 单应用骨架

这是一个面向 **单个 Shopify App** 的前端工程骨架仓库，当前可运行应用为 [apps/admin](https://git.bestfulfill.tech/shopifyhatchery/frontend/sh-shopify-app-admin-template)。

仓库目标：

- 统一 Shopify Embedded Admin 应用的目录结构
- 统一开发、检测、构建、发布脚本
- 统一共享配置与依赖安装方式
- 为后续扩展 `site`、`extensions/*` 和共享包保留清晰边界

## 当前架构

当前仓库按单 App 骨架组织：

```txt
apps/
  admin/                  # Shopify 商家后台前端（当前已实现）
  site/                   # 官网/帮助中心/营销站（预留）

extensions/               # Shopify App Extensions（预留）
packages/                 # 共享配置与公共能力
scripts/                  # workspace 与发布脚本
docs/                     # 仓库级架构与发布文档
```

当前已落地目录：

- [apps/admin](https://git.bestfulfill.tech/shopifyhatchery/frontend/sh-shopify-app-admin-template/)：Next.js Pages Router 应用
- [packages/config-eslint](/Users/fengdebing/shopify-app/sh-shopify-app-admin-template/packages/config-eslint)
- [packages/config-typescript](/Users/fengdebing/shopify-app/sh-shopify-app-admin-template/packages/config-typescript)
- [extensions](/Users/fengdebing/shopify-app/sh-shopify-app-admin-template/extensions)：扩展目录占位
- [Admin UI Extension 学习手册](docs/admin-ui-extensions/README.md)：Block、Action、Selection Action 的技术文档与物流 demo
- [Admin UI Extension 物流 demo](extensions/admin-ui-logistics-demo/README.md)：可运行的三类 Admin target 示例
- [Checkout 扩展学习工程](docs/checkout-ui/README.md)：12 个 Checkout、Order Status 与 Functions Demo 的启动、验证和限制

## apps/admin 结构

`apps/admin` 按 Pages Router + Shopify Embedded 壳层组织：

```txt
apps/admin/
  pages/                  # 页面与 API Route
  components/             # 壳层与通用组件
  config/                 # runtime / server 配置读取
  lib/                    # 运行时代码
  examples/               # 示例代码
  messages/               # 国际化文案
  public/                 # 静态资源与 config.json
  styles/                 # 全局样式
  test/                   # 测试辅助文件
  docs/                   # admin 模块文档
  proxy.ts                # 语言路由代理
```

说明：

- 页面路由使用 `/{locale}` 形态，例如 `/en`、`/zh-CN/settings`
- App Bridge 脚本与 `shopify-api-key` 注入位于 `pages/_document.tsx`
- Provider 装配统一收敛在 `components/EmbeddedAppShell.client.tsx`
- 生产启动采用 **Next standalone**，启动命令为 `node dist/server.js`

## 技术栈

- Next.js 16（Pages Router）
- React 18
- TypeScript
- Shopify Polaris
- Shopify App Bridge
- next-intl
- pnpm workspace
- Vitest

## 安装依赖

只需要在仓库根目录执行一次：

```bash
pnpm install
```

说明：

- 依赖统一安装在 workspace 维度
- 不需要进入 `apps/admin` 或其他模块单独执行 `pnpm install`

## 常用脚本

仓库根脚本：

- `pnpm dev`：启动 `apps/admin`
- `pnpm dev:admin`：启动 admin 开发环境
- `pnpm start`：启动 admin standalone 产物
- `pnpm lint`：运行所有 workspace 的 lint
- `pnpm typecheck`：运行所有 workspace 的类型检查
- `pnpm test`：运行所有 workspace 的测试
- `pnpm check`：执行 `lint + typecheck + test`
- `pnpm build`：构建所有 apps 与 extensions
- `pnpm build:admin`：仅构建 `apps/admin`
- `pnpm check:admin`：仅校验 `apps/admin`

`apps/admin` 自身脚本：

- `pnpm --filter ./apps/admin dev`
- `pnpm --filter ./apps/admin build`
- `pnpm --filter ./apps/admin start`
- `pnpm --filter ./apps/admin test`
- `pnpm --filter ./apps/admin check`

## 开发启动

### 方式一：直连模式（仅启动前端）

```bash
pnpm dev
```

等价于：

```bash
pnpm dev:admin
```

适用场景：

- 前端页面开发
- 直连测试 / 生产后端联调

### 方式二：代理模式（本地代理 + Shopify CLI）

```bash
pnpm app:dev
```

建议：

- 需要本地代理后端 API 时使用代理模式，Shopify CLI 会同时拉起 `apps/admin` 和 `apps/local-proxy`
- 代理模式下，浏览器侧业务后端地址使用 `/dev-proxy/proxy/api`
- `/dev-proxy` 只允许用于本地开发，不允许写入测试或生产环境变量 / `public/conf/config.json`
- 只需要前端直连既有后端时使用直连模式
- 嵌入式场景优先通过 Shopify Admin 入口打开
- 不要直接裸开 `localhost:3000` 作为主要联调方式
- 单独排查代理进程时，可以运行 `pnpm dev:proxy`

## Shopify CLI 脚本

为保持命令入口统一，常用 Shopify App CLI 已收口到根脚本：

- `pnpm app:dev`
- `pnpm app:info`
- `pnpm app:info:production`
- `pnpm app:link`
- `pnpm app:deploy`
- `pnpm app:deploy:test`
- `pnpm app:deploy:production`
- `pnpm app:config:validate`
- `pnpm app:config:validate:production`
- `pnpm app:config:guard`

说明：

- 这些命令默认在仓库根目录执行
- `pnpm app:dev` 默认读取 `shopify.app.toml`
- `pnpm app:deploy` 默认发布默认配置，等价于 `pnpm app:deploy:test`
- Production 发布必须显式执行 `pnpm app:deploy:production`
- `apps/admin/shopify.web.toml` 会告诉 `shopify app dev` 如何启动前端进程
- 本地联调优先使用脚本，不建议直接执行裸命令
- `app:config:validate` 校验 `shopify.app.toml`
- `app:config:validate:production` 校验 `shopify.app.production.toml`
- `app:config:guard` 执行项目自定义规则，防止测试/生产配置互相污染

## Shopify 环境配置

Shopify App 配置以仓库中的 TOML 文件为唯一配置源。Partner Dev Dashboard 只用于首次创建 Shopify App、获取 `client_id` / App 基础信息、申请受保护权限或处理 Shopify 审批事项。

仓库只维护两份 Shopify App CLI 配置文件：

| 文件 | 用途 | 绑定对象 |
| --- | --- | --- |
| `shopify.app.toml` | 本地开发 + 测试环境 | Dev/Test Shopify App |
| `shopify.app.production.toml` | 生产环境 | Production Shopify App |

两个文件必须绑定不同 Shopify App，避免本地或测试配置影响线上商家。日常配置变更通过 Git 修改 TOML 并使用 Shopify CLI 发布，不再通过 Partner Dev Dashboard 或运营平台维护 `scopes` / `topics`。

当前学习模板的开发配置绑定 Shopify App：`b619d8b384633280bb72ad2004be8993`。如果后续切换到其他 Dev/Test App，需要将 `shopify.app.toml` 中的 `client_id` 替换为对应 App 的 ID。

生产 `client_id`、域名和 webhook 地址仍是占位示例。接入具体 App 时，需要先替换为真实 Production Shopify App 信息，再执行 Shopify CLI 原生校验和 deploy。如果具体产品仓库或发布流水线需要强制绑定真实 App，可设置 `SHOPIFY_TEST_CLIENT_ID` 和 `SHOPIFY_PRODUCTION_CLIENT_ID`，让 `pnpm app:config:guard` 执行精确匹配校验。

初始化新 App 时，按当前 App 和环境分别修改对应文件。两个 TOML 都需要维护：

- `client_id`
- `name`
- `application_url`
- `embedded = true`
- `[build] include_config_on_deploy = true`
- `[build] automatically_update_urls_on_dev`（默认配置可为 `true`，生产配置必须为 `false`）
- `[access_scopes] scopes`
- `[access_scopes] optional_scopes`
- `[access_scopes] use_legacy_install_flow = false`
- `[auth] redirect_urls`
- `[webhooks] api_version`
- `app/uninstalled` webhook
- `app/scopes_update` webhook

以下内容禁止写入 TOML：

- `client_secret`
- Admin API Access Token
- Refresh Token
- 店铺级 Token
- 生产密钥

本地开发默认使用 `shopify.app.toml`：

```bash
pnpm app:config:validate
pnpm app:dev
```

测试环境发布也使用 `shopify.app.toml`。发布前必须确认 `application_url`、`redirect_urls` 和 webhook 地址没有停留在个人本地 tunnel：

```bash
pnpm app:config:validate
pnpm app:config:guard
pnpm app:deploy:test
```

生产环境只使用 `shopify.app.production.toml`：

```bash
pnpm app:config:validate:production
pnpm app:config:guard
pnpm app:deploy:production
```

- `shopify.app.toml` 默认允许 Shopify CLI 自动更新 URL，方便固定开发 App 开箱运行
- 测试发布前必须确认当前配置指向测试域名，避免个人 tunnel 地址污染测试配置
- `shopify.app.production.toml` 中 `automatically_update_urls_on_dev = false`，避免本地联调覆盖生产链接

## 环境与发布原则

建议环境边界：

- `Local Dev`：允许本地代理 `/dev-proxy/proxy/api`，允许本地 tunnel
- `Test`：必须直连测试业务后端，不允许 `/dev-proxy`
- `Prod`：必须直连生产业务后端，不允许 `/dev-proxy`

发布约束：

- 不要在共享 Test 配置上直接执行 `pnpm app:dev`
- `shopify.app.toml` 只绑定 Dev/Test Shopify App
- `shopify.app.production.toml` 只绑定 Production Shopify App
- 发布前必须核对 `application_url`、`redirect_urls`、`scopes` 与目标环境预期一致
- 发布前必须确认 `webhooks.uri` 指向对应环境后端
- 测试 / 生产运行配置中的 `BACKEND_API_BASE`、`NEXT_PUBLIC_BACKEND_API_BASE` 和 `public/conf/config.json` 不允许以 `/dev-proxy` 开头
- 生产发布必须经过 PR Review，并通过 `pnpm check`
- App Store 审核前必须确认 compliance webhook 配置完整且返回 `2xx`

## 常见问题

### 缺少 `host`

现象：

- 页面显示 `Missing host param`

处理：

- 从 Shopify Admin 嵌入入口打开应用
- 或确认后端重定向时保留了 `host` / `shop`

### `window.shopify` 不可用

处理：

- 确认 `pages/_document.tsx` 正确注入 App Bridge 脚本
- 确认页面运行在 Shopify Admin iframe 内

### 启动时报环境变量缺失

处理：

- 检查 `apps/admin/.env.local`
- 检查 `public/conf/config.json`
- 检查 `lib/env.ts` 与 `config/runtime-config.ts` 的字段是否匹配

### Shopify 配置校验失败

处理：

- 执行 `pnpm app:config:validate`
- 执行 `pnpm app:config:validate:production`
- 执行 `pnpm app:config:guard`
- 确认测试和生产 TOML 使用不同 `client_id`
- 确认 `use_legacy_install_flow = false`
- 确认已配置 `app/uninstalled` 和 `app/scopes_update`
- 确认生产 TOML 未包含测试域名

## 相关文档

仓库级文档：

- [单应用骨架说明](/Users/fengdebing/shopify-app/sh-shopify-app-admin-template/docs/architecture/single-app-skeleton.md)
- [发布检查清单](/Users/fengdebing/shopify-app/sh-shopify-app-admin-template/docs/release/checklist.md)
- [Shopify 配置发布说明](/Users/fengdebing/shopify-app/sh-shopify-app-admin-template/docs/release/shopify-config-release.md)

admin 模块文档：

- [技术设计](/Users/fengdebing/shopify-app/sh-shopify-app-admin-template/apps/admin/docs/technical-design.md)
- [开发实践](/Users/fengdebing/shopify-app/sh-shopify-app-admin-template/apps/admin/docs/dev-practices.md)
- [App Bridge 能力验证清单](/Users/fengdebing/shopify-app/sh-shopify-app-admin-template/apps/admin/docs/app-bridge-capabilities.md)

历史实施记录：

- [V3 骨架整改计划](/Users/fengdebing/shopify-app/sh-shopify-app-admin-template/docs/superpowers/plans/2026-05-13-shopify-v3-skeleton.md)
- [Pages Router 迁移计划](/Users/fengdebing/shopify-app/sh-shopify-app-admin-template/docs/superpowers/plans/2026-05-14-pages-router-migration.md)
