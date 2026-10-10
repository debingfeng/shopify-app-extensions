# `feat/v3.0` 分支更新说明

## 一、更新概览

本分支主要完成了 Shopify App v3.0 工程骨架的重构与统一，重点包括：

- 完善 v3.0 骨架规划与环境治理
- 补齐 Shopify Compliance Webhook 基线
- 去除测试环境硬编码，统一配置入口
- 优化 Embedded 导航与首屏加载体验
- 将应用目录从 `apps/Home` 调整为 `apps/admin`
- 补齐 workspace 脚本、共享配置和最小测试基线
- 将 `apps/admin` 从 App Router 迁移到 Pages Router
- 收敛 `apps/admin` 目录结构，移除 `src/*` 外层
- 统一 README 和项目文档为简体中文
- 将 Shopify CLI 命令统一为根脚本入口

## 二、核心变更

### 1. 工程与环境治理

- 增加 v3.0 骨架实施计划
- 明确 Local Dev / Test / Prod 环境边界
- 关闭共享配置上的开发期 URL 自动覆盖
- 补充发布前环境检查规则

### 2. Shopify 配置与联调

- 增加 Compliance Webhook 配置
- 将 Shopify 转发链路改为配置驱动
- 去除测试环境域名硬编码

### 3. Embedded 体验优化

- 侧栏菜单改为前端导航，保留 `host/shop`
- 优化首屏骨架与加载状态
- 修复嵌入式壳层 lint 基线问题

### 4. 目录与脚本统一

- `apps/Home` 重命名为 `apps/admin`
- 增加 workspace 统一脚本和共享配置包
- 增加最小测试与 `check` 基线
- 将 `src/components`、`src/lib`、`src/config` 等提升到 `apps/admin` 根目录

### 5. Pages Router 迁移

- 页面入口迁移到 `pages/*`
- Shopify API 迁移到 `pages/api/*`
- 删除旧 `src/app/*`
- 生产启动切换为 standalone
- `middleware.ts` 改为 `proxy.ts`

### 6. 文档与命令统一

- README、根 `docs/`、`apps/admin/docs/` 改为简体中文
- 新增仓库级架构与发布文档
- Shopify CLI 命令统一为根脚本：
  - `pnpm app:dev`
  - `pnpm app:info`
  - `pnpm app:link`
  - `pnpm app:deploy`

## 三、当前状态

当前分支已经完成以下状态：

- `apps/admin` 已稳定运行在 Pages Router 下
- `apps/admin` 目录结构与脚本入口已统一
- README 与文档已和当前代码结构保持一致
- `pnpm check` 和 `pnpm build` 均通过
- 当前未发现新的阻塞性问题

说明：

- `build:extensions` 在当前没有 extension workspace 时输出 `No projects matched`，属于预期行为

## 四、提交范围

本分支相对 `v2.2.0` 基线，累计包含 23 个提交，主要围绕：

- v3.0 骨架规划
- 环境治理
- Compliance Webhook
- Embedded 体验优化
- workspace 统一
- Pages Router 迁移
- 目录收口
- 中文文档重写
- Shopify CLI 脚本统一
