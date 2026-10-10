# Pages Router 迁移计划（历史记录）

> 本文档为历史迁移计划归档，当前 `apps/admin` 已完成从 App Router 到 Pages Router 的切换。

## 迁移目标

- 保留 `/{locale}` 国际化路由
- 保留 Shopify Embedded 壳层能力
- 将入口层统一迁移到 `pages/*`
- 清理旧的 App Router 入口

## 当时的迁移范围

### 页面入口

- `pages/_app.tsx`
- `pages/_document.tsx`
- `pages/_error.tsx`
- `pages/index.tsx`
- `pages/[locale]/index.tsx`
- `pages/[locale]/settings.tsx`
- `pages/[locale]/help.tsx`

### API Route

- `pages/api/v2/shopify/entry/[appName].ts`
- `pages/api/v2/shopify/callback/[appName].ts`

### 配套辅助

- i18n 页面辅助函数
- Pages Router 下的路由跳转适配
- 删除旧 `src/app/*`

## 迁移结果摘要

当前 `apps/admin` 已具备以下状态：

- 页面入口全部位于 `pages/*`
- `src/app/*` 已删除
- 全局入口改为 Pages Router
- 构建采用 standalone 产物
- 路由维持 `/{locale}` 结构

## 当前参考文档

- [README](/Users/fengdebing/shopify-app/sh-shopify-app-admin-template/README.md)
- [admin 技术设计](/Users/fengdebing/shopify-app/sh-shopify-app-admin-template/apps/admin/docs/technical-design.md)
- [admin 开发实践](/Users/fengdebing/shopify-app/sh-shopify-app-admin-template/apps/admin/docs/dev-practices.md)
