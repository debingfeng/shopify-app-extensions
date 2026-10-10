# 单应用骨架说明

## 定位

本仓库承载的是 **单个 Shopify App** 的标准工程骨架，而不是多 App 矩阵仓库。

目标：

- 统一单 App 的工程结构
- 统一开发、检测、构建、发布方式
- 统一共享配置与公共能力沉淀方式
- 让后续新 App 可以直接复用该骨架

## 推荐目录

```txt
apps/
  admin/
  site/

extensions/
  theme-ext/
  checkout-ui/
  function-discount/

packages/
  config-eslint/
  config-typescript/
  shopify-embedded/
  api-client/
  monitoring/
  ui-shared/
  test-utils/

scripts/
  workspace/
  release/

docs/
  architecture/
  release/
```

## 当前落地情况

当前仓库已实现：

- `apps/admin`
- `packages/config-eslint`
- `packages/config-typescript`
- 根目录统一脚本
- `docs/architecture`
- `docs/release`

当前预留但未落地：

- `apps/site`
- `extensions/*`
- 其他业务型共享包

## 目录职责

### `apps/admin`

Shopify 商家后台前端，当前仓库唯一可运行应用。

### `apps/site`

官网、帮助中心、营销页或其他外部站点，当前为预留目录。

### `extensions/*`

当前 App 对应的 Shopify 扩展，例如：

- Theme App Extension
- Checkout UI Extension
- Shopify Function

### `packages/*`

共享配置和公共能力，只放跨模块复用的稳定底座，不放具体业务实现。

### `scripts/*`

仓库级脚本编排入口，用于统一开发、检查、构建、发布流程。

### `docs/*`

仓库级说明文档，用于描述架构、约定和发布流程。

## 设计原则

- `apps` 和 `extensions` 是交付单元
- `packages` 是共享底座
- 根目录脚本负责编排，子模块脚本负责执行
- 依赖统一在 workspace 安装，不在每个模块重复安装
- 单个 App 可以独立开发、检测、构建、发布

## 当前脚本分层

根目录：

- `pnpm dev`
- `pnpm start`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm check`
- `pnpm build`

子模块：

- `apps/admin: dev / build / start / lint / typecheck / test / check`

## 结论

当前仓库的标准表达应为：

**以 `apps/admin` 作为当前单 App 的商家后台，以 `extensions/*` 作为扩展预留，以 `packages/*` 作为共享底座，以 `scripts/*` 作为统一入口。**
