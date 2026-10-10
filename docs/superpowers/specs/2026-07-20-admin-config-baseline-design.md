# apps/admin 配置基座设计

## 背景

当前 `apps/admin` 的配置字段分散在 `.env.example`、`public/conf/config.json`、`config/runtime-config.ts`、`config/server-config.ts`、README 和发布 checklist 中。字段重复定义会带来三类风险：

- 新增字段时容易漏改某一处。
- 客户端运行时配置和服务端配置的读取规则不一致。
- 发布前只能靠人工核对字段，缺少可执行的 smoke test。

本设计只服务 `apps/admin`，不抽取 workspace 级 `packages`。目标是在当前单 App 骨架内建立轻量、清晰、可测试的配置契约。

## 目标

- 对齐 `.env.example`、运行时配置、服务端配置、README 字段定义。
- 增加配置 schema 校验，能明确报告缺失或格式错误的配置。
- 注入 `buildVersion` 等模板运行标识，便于发布后确认当前运行产物。
- 增加最小 smoke test，覆盖配置读取、校验和运行标识。
- 更新接入文档和发布 checklist，让发布核对步骤可执行。

## 非目标

- 不抽取 `packages/config-*` 或其他共享包。
- 不引入完整 E2E 测试框架。
- 不强制 CI 必须提供 git sha；本地和非 CI 构建需要有可用回退值。
- 不改动业务 API、Shopify OAuth 或 App Bridge 行为。

## 推荐方案

在 `apps/admin/config` 内新增配置契约模块，作为字段定义和校验逻辑的唯一来源。`runtime-config.ts`、`server-config.ts` 和新增 smoke test 都消费这份契约。

核心文件职责：

- `apps/admin/config/app-config-schema.ts`：声明字段、类型、必填规则、URL 校验、运行标识构建和校验函数。
- `apps/admin/config/runtime-config.ts`：客户端运行时配置读取，生产环境优先读 `/conf/config.json`，失败后回退构建期环境变量，并通过 schema 校验。
- `apps/admin/config/server-config.ts`：服务端配置读取，优先级为服务端 env、`NEXT_PUBLIC_*` env、`public/conf/config.json`，并通过 schema 校验。
- `apps/admin/pages/api/health.ts`：提供最小健康检查接口，返回 `ok`、`buildVersion` 和必要配置状态。
- `apps/admin/config/*.test.ts` 或 `apps/admin/pages/api/*.test.ts`：覆盖配置 schema、读取优先级、错误信息和健康检查返回。
- `README.md`、`apps/admin/.env.example`、`docs/release/checklist.md`：更新字段定义、读取优先级和发布检查步骤。

## 配置字段

### 核心字段

| 字段 | 客户端变量 | 服务端变量 | 来源 | 是否必填 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `SHOPIFY_API_KEY` | `NEXT_PUBLIC_SHOPIFY_API_KEY` | `SHOPIFY_API_KEY` | env / config.json | 是 | Shopify App client ID，用于 App Bridge 注入 |
| `BACKEND_API_BASE` | `NEXT_PUBLIC_BACKEND_API_BASE` | `BACKEND_API_BASE` | env / config.json | 是 | 业务后端 API 根地址 |
| `PLATFORM_API_BASE` | `NEXT_PUBLIC_PLATFORM_API_BASE` | `PLATFORM_API_BASE` | env / config.json | 是 | Shopify entry/callback 中台转发目标，不回退 `BACKEND_API_BASE` |
| `APP_NAME` | `NEXT_PUBLIC_APP_NAME` | `APP_NAME` | env / config.json | 是 | 路由 appName 默认值，与平台侧注册名一致 |
| `APP_ORIGINS` | `NEXT_PUBLIC_APP_ORIGINS` | `APP_ORIGINS` | env / config.json | 是 | 允许的 app origins，写入 `shopify-app-origins` meta |
| `SENTRY_DSN` | `NEXT_PUBLIC_SENTRY_DSN` | `SENTRY_DSN` | env / config.json | 否 | 前端错误监控 DSN |

### 运行标识字段

| 字段 | 变量 | 是否必填 | 说明 |
| --- | --- | --- | --- |
| `buildVersion` | `NEXT_PUBLIC_BUILD_VERSION` / `BUILD_VERSION` | 否 | 当前运行产物版本，优先使用 CI 注入值 |
| `buildTime` | `NEXT_PUBLIC_BUILD_TIME` / `BUILD_TIME` | 否 | 构建时间，缺省可使用构建时生成值 |
| `commitSha` | `NEXT_PUBLIC_COMMIT_SHA` / `COMMIT_SHA` | 否 | 当前提交 SHA，CI 有值时注入 |

运行标识不参与业务请求拼接，不应成为页面启动的硬阻塞。缺失时使用明确回退值，例如 package version 或 `"dev"`。

## 读取规则

### 客户端

- 开发环境读取 `NEXT_PUBLIC_*`。
- 生产环境优先请求 `/conf/config.json?t=<timestamp>`。
- 请求失败时回退到构建期 `NEXT_PUBLIC_*`。
- 最终配置必须经过 schema 校验；错误信息带上字段名和原因。

### 服务端

读取单个字段时按以下优先级：

1. 服务端变量，例如 `PLATFORM_API_BASE`。
2. 公开变量，例如 `NEXT_PUBLIC_PLATFORM_API_BASE`。
3. `public/conf/config.json` 中的同名字段。
4. 空字符串或运行标识回退值。

`getServerAppConfig()` 返回完整配置对象，并执行 schema 校验。`PLATFORM_API_BASE` 必须独立配置，不允许回退 `BACKEND_API_BASE`。

## Schema 校验

校验函数返回结构化结果：

- 成功：返回规范化后的配置对象。
- 失败：返回字段级错误，错误文案包含字段名、期望和实际问题。

建议规则：

- 必填字段不得为空字符串。
- `BACKEND_API_BASE` 和 `PLATFORM_API_BASE` 必须是 `http` 或 `https` URL。
- `APP_ORIGINS` 支持逗号分隔 URL，每一项必须是 `http` 或 `https` URL。
- `SENTRY_DSN` 为空时允许；非空时必须是 URL。
- 运行标识允许缺省，但输出需要有稳定回退值。

## Smoke Test

最小 smoke test 只覆盖基座闭环，不覆盖业务页面。

必测项：

- 合法配置通过 schema 校验。
- 缺少 `PLATFORM_API_BASE` 时返回明确错误。
- 服务端 env 优先于 `NEXT_PUBLIC_*` 和 `config.json`。
- `config.json` 字段能被服务端读取。
- `getServerAppConfig()` 返回运行标识。
- 健康检查接口返回 `ok: true` 和 `buildVersion`。

推荐脚本：

- 保留 `pnpm --filter ./apps/admin test` 作为单元测试入口。
- 可新增 `pnpm --filter ./apps/admin smoke`，执行配置相关最小测试或健康检查脚本。

## 文档更新

README 增加 `apps/admin` 配置字段表、读取优先级和运行标识说明。

`.env.example` 与 schema 保持一致，补充：

- `NEXT_PUBLIC_SENTRY_DSN`
- `NEXT_PUBLIC_BUILD_VERSION`
- `NEXT_PUBLIC_BUILD_TIME`
- `NEXT_PUBLIC_COMMIT_SHA`
- 对应服务端覆盖变量注释。

发布 checklist 增加：

- 执行配置 schema / smoke test。
- 确认测试和生产环境的 `config.json` 字段完整。
- 确认 `/api/health` 返回当前 `buildVersion`。
- 确认 `PLATFORM_API_BASE` 未错误回退到 `BACKEND_API_BASE`。

## 风险与取舍

- 不自动生成 `.env.example` 和 README 字段表，短期仍需人工维护；通过 schema 测试降低漂移风险。
- `buildVersion` 的 CI 注入方式需要发布系统配合；本设计提供回退值，避免阻塞本地开发。
- 健康检查接口不能暴露敏感配置，只返回状态和运行标识。

## 验收标准

- `apps/admin` 的配置字段定义以 `app-config-schema.ts` 为准。
- `runtime-config.ts` 和 `server-config.ts` 都通过 schema 校验。
- `pnpm --filter ./apps/admin test` 覆盖配置校验、服务端读取优先级和运行标识。
- README、`.env.example`、发布 checklist 字段一致。
- 发布前可以通过健康检查确认运行产物版本。
