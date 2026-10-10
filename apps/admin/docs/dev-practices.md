# admin 开发实践

本文档记录 [apps/admin](/Users/fengdebing/shopify-app/sh-shopify-app-admin-template/apps/admin) 的开发约定。

## 环境约定

### 环境边界

- 本地开发：优先使用本地代理和独立 tunnel
- 测试环境：直连测试后端
- 生产环境：直连生产后端

### 本地启动

```bash
pnpm app:dev
pnpm dev:admin
```

使用建议：

- 需要本地代理业务 API 时，用代理模式：`pnpm app:dev`
- 代理模式下，浏览器侧 `BACKEND_API_BASE` 使用 `/dev-proxy/proxy/api`
- `/dev-proxy` 只允许用于本地开发；测试和生产必须配置真实业务后端 URL
- 只需要前端直连后端时，用直连模式：`pnpm dev:admin`
- 单独排查 local-proxy 时，可以运行 `pnpm dev:proxy`
- 当前 v4.0 只覆盖 API 代理，不接管 Shopify entry / callback，也不做 cookie 改写

最小排障：

- 检查 `BACKEND_PORT`、`LOCAL_PROXY_PORT`
- 检查 local-proxy 的 `/health`

### Shopify 配置隔离

- 不要在共享测试配置上直接执行 `pnpm app:dev`
- 本地调试至少隔离以下一项：
  - 独立 Shopify App
  - 独立 tunnel 域名
  - 独立本地 `toml` 配置

## 目录约定

- `pages/` 只放页面入口和 API Route
- `components/` 只放组件与壳层
- `config/` 只放配置读取逻辑
- `lib/` 只放运行时代码
- `examples/` 只放示例代码

额外约束：

- `components/EmbeddedAppShell.client.tsx` 是唯一 Provider 装配入口
- 不再维护并行 `Providers.tsx`
- 示例代码不要混入 `lib/`

## 页面开发约定

- 页面统一放到 `pages/[locale]/...`
- 新页面默认需要支持 `host` / `shop` 上下文
- 应用内跳转优先复用现有导航辅助函数
- 不要在页面里直接堆 `window.shopify` 调用

## API 开发约定

- 浏览器 API 封装统一放到 `lib/api/`
- 按领域拆分文件，例如：
  - `settings.ts`
  - `orders.ts`
  - `profile.ts`
- 错误处理统一走已有 client 层，不要在页面里重复写 fetch 基线

## 国际化约定

- 路由保持 `/{locale}` 结构
- 文案放在 `messages/`
- 新增语言时同时更新：
  - `lib/i18n/routing.ts`
  - `messages/*`
  - Polaris 语言映射

## 提交前校验

至少执行：

```bash
pnpm check
```

涉及构建、入口层、配置或发布链路变更时，再执行：

```bash
pnpm build
```

## 文档约定

- 仓库级说明写到根目录 `README.md` 和 `docs/`
- admin 模块实现细节写到 `apps/admin/docs/`
- 方案或实施记录保留在 `docs/superpowers/plans/`
