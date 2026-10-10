# admin 技术设计

本文档描述 [apps/admin](/Users/fengdebing/shopify-app/sh-shopify-app-admin-template/apps/admin) 的当前技术实现。

## 目标

- 提供可运行的 Shopify Embedded Admin 前端壳层
- 统一处理 `host` / `shop` 上下文
- 提供稳定的 Pages Router 国际化结构
- 为后续业务页面和平台联调保留清晰扩展点

## 技术栈

- Next.js 16（Pages Router）
- React 18
- TypeScript
- Shopify Polaris
- Shopify App Bridge
- next-intl
- Vitest

## 架构总览

```txt
Shopify Admin
  └─ Embedded App iframe
      ├─ pages/_document.tsx
      │   ├─ 注入 shopify-api-key
      │   ├─ 注入 app-bridge.js
      │   └─ 预处理 host / shop
      ├─ proxy.ts
      │   └─ 处理 locale 路由前缀
      └─ pages/_app.tsx
          └─ EmbeddedAppShell
              ├─ NextIntlClientProvider
              ├─ Polaris AppProvider
              ├─ ShopifyHostProvider
              ├─ ShopifyAppBridgeProvider
              └─ ShopifyActionsProvider
```

## 目录职责

### `pages/`

- 页面入口
- API Route
- `_app.tsx`
- `_document.tsx`
- `_error.tsx`

### `components/`

放嵌入式壳层与通用 UI 组件。

核心文件：

- `EmbeddedAppShell.tsx`
- `EmbeddedAppShell.client.tsx`
- `AppBridgeNav.tsx`
- `AppBridgeNavLazy.tsx`
- `PolarisSkeletonShell.tsx`

### `config/`

放运行时配置读取逻辑：

- `runtime-config.ts`
- `server-config.ts`

### `lib/`

放真实运行时代码：

- `api/`
- `i18n/`
- `shopify/`
- `monitoring/`
- `env.ts`

### `examples/`

放示例代码，不参与默认运行链路。

## 路由设计

采用 `/{locale}` 结构：

- `/en`
- `/en/settings`
- `/en/help`
- `/zh-CN`

当前默认语言：

- `en`

支持语言：

- `en`
- `zh-CN`

相关文件：

- `pages/index.tsx`
- `pages/[locale]/index.tsx`
- `pages/[locale]/settings.tsx`
- `pages/[locale]/help.tsx`
- `lib/i18n/pages.ts`
- `lib/i18n/routing.ts`
- `proxy.ts`

## App Bridge 与嵌入上下文

### 初始化

`pages/_document.tsx` 负责：

- 注入 `<meta name="shopify-api-key" />`
- 注入 Shopify App Bridge CDN
- 预处理 `host` / `shop`

### 上下文解析

`components/EmbeddedAppShell.tsx` 与 `components/EmbeddedAppShell.client.tsx` 负责：

- 从 URL 读取 `host`
- 从 `window.shopify.config` 读取 `host`
- 必要时通过 `referrer` 辅助推断店铺来源
- 在缺少 `host` 时展示明确错误态

### Provider 约定

Provider 只保留一套入口：

- `ShopifyHostProvider`
- `ShopifyAppBridgeProvider`
- `ShopifyActionsProvider`

不再维护并行 Provider 结构。

## API 设计

### 浏览器侧

统一通过 `lib/api/client.ts` 和 `lib/api/useApiClient.ts` 调用后端接口。

主要职责：

- 统一请求头
- 统一 token 注入
- 统一错误处理
- 统一重授权处理
- 统一错误上报

### 服务端联调路由

当前保留两条平台联调路由：

- `pages/api/v2/shopify/entry/[appName].ts`
- `pages/api/v2/shopify/callback/[appName].ts`

职责：

- 校验必要参数
- 转发到平台网关
- 处理 iframe 响应头
- 处理 locale / redirect 修正

## 配置设计

### 开发环境

来源：

- `apps/admin/.env.local`

### 生产运行时

来源：

- `public/conf/config.json`

### 统一读取入口

- `config/runtime-config.ts`
- `config/server-config.ts`
- `lib/env.ts`

关键字段：

- `SHOPIFY_API_KEY`
- `BACKEND_API_BASE`
- `PLATFORM_API_BASE`
- `APP_NAME`
- `APP_ORIGINS`

## 构建与启动

构建方式：

- `next build`
- `postbuild` 阶段整理 standalone 产物

启动方式：

- `node dist/server.js`

说明：

当前生产运行标准是 **Next standalone**，不是 `next start`。

## 测试与校验

推荐最小校验链路：

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm check`
- `pnpm build`

当前已覆盖的最小测试重点：

- i18n 页面辅助函数
- API 转发辅助逻辑
- Shopify URL 辅助函数

## 后续扩展建议

- 新页面统一加到 `pages/[locale]/...`
- 新 API 统一落到 `lib/api/`，按领域拆分
- 示例代码只放 `examples/`
- 跳转统一保留 `host` / `shop`
- 新增 Shopify 扩展时放到仓库根 `extensions/*`
