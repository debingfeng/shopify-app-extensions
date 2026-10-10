# Shopify App V3 骨架整改计划（历史记录）

> 本文档为历史实施计划归档，当前相关能力已完成落地，保留用于追溯整改范围与目标。

## 目标

将仓库从基础模板升级为可用于 v3.0 需求落地的 Shopify Embedded App 工程骨架。

## 当时的整改重点

### P0

- 环境隔离与发布安全
- Compliance Webhook 基线
- 去掉测试环境硬编码
- 修复 lint / 安装 / 构建基线

### P1

- 侧栏菜单改为保留 `host` / `shop` 的前端跳转
- 优化首屏骨架与壳层加载稳定性
- 校正文档与配置漂移

### P2

- 增加最小自动化验证
- 清理过期壳层路径和示例代码
- 完善发布前检查项

## 实施结果摘要

已完成的关键事项包括：

- environment topology 规则落地
- compliance webhook 声明补齐
- Shopify 转发链路配置化
- embedded 导航前端化
- Pages Router 化
- `apps/Home` 重命名为 `apps/admin`
- `src/*` 提升为 app 根目录
- workspace 统一脚本和共享配置包

## 当前对应文档

- [README](/Users/fengdebing/shopify-app/sh-shopify-app-admin-template/README.md)
- [单应用骨架说明](/Users/fengdebing/shopify-app/sh-shopify-app-admin-template/docs/architecture/single-app-skeleton.md)
- [发布检查清单](/Users/fengdebing/shopify-app/sh-shopify-app-admin-template/docs/release/checklist.md)
- [admin 技术设计](/Users/fengdebing/shopify-app/sh-shopify-app-admin-template/apps/admin/docs/technical-design.md)
