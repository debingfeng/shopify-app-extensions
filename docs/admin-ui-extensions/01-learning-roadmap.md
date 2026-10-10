# 学习路线与概念地图

## 1. Admin UI Extension 解决什么问题

Admin UI Extension 把 App 的小块功能嵌入 Shopify Admin 的订单、商品、客户等原生工作流。商家可以在查看资源时直接看到上下文信息，或从 More actions 菜单触发一个短流程，不需要先离开 Admin 打开完整 App。

Extension 适合：

- 显示当前订单的物流状态、异常和预计送达。
- 对当前资源执行一次刷新、同步、导出或校验。
- 对订单列表中选中的多个资源执行批量操作。

Extension 不适合：

- 复杂报表、长流程配置和大量表单。
- 需要持续运行的任务、队列和第三方服务编排。
- 需要展示大量历史数据的完整工作台。

这些能力应该由 Embedded App 和 App backend 承担，Extension 只提供进入点和轻量反馈。

## 2. 六类 Target

| Target 类型 | 入口形态 | 典型用途 |
| --- | --- | --- |
| Action | More actions → modal | 刷新物流、同步 ERP、修改业务状态 |
| Selection Action | 订单列表选择多条 → bulk actions | 批量同步、批量导出、批量打标 |
| Block | 详情页内联卡片 | 物流状态、风控摘要、外部系统信息 |
| Print Action | Print 菜单 | 面单、发票、拣货单 |
| Configuration | 配置界面 | Shopify Function 或产品配置 |
| Runnable | 无 UI 执行 | Sidekick 数据、模板或其他可调用能力 |

本阶段先掌握 Block、Action、Selection Action。它们分别对应“看见信息”“处理一个资源”“处理一批资源”的三种工作流。

## 3. 关键 API 记忆表

| API | 作用 | 何时使用 |
| --- | --- | --- |
| `shopify.data.selected` | 读取当前详情资源或列表选中资源的 ID | 所有上下文业务的起点 |
| `shopify.query()` | 直接调用 Shopify GraphQL Admin API | 读取 Shopify 自有资源且不需要自有业务库时 |
| `fetch()` | 调用 App backend | 物流、ERP、数据库、复杂业务逻辑 |
| `shopify.auth.idToken()` | 为跨域 backend 手动取得 ID Token | 目标域名不是 App URL 或其子域时 |
| `shopify.close()` | 关闭 Action modal | Action 成功或用户取消时 |
| `shopify.navigation.navigate()` | 从 Block 导航到 Action 或允许的 Admin 页面 | 需要把只读卡片升级为交互流程时 |

## 4. 官方示例如何迁移到本仓库

官方 `example-admin-action-and-block-preact` 展示了 Preact、`shopify.extension.toml`、`s-admin-block` 和 `s-admin-action` 的基本结构。本仓库在此基础上增加了：

1. 共享的上下文读取函数，避免每个 target 重复解析数据。
2. 物流 mock adapter，让没有后端时也能讲解状态流转。
3. Selection Action 的部分失败结果，展示真实批处理需要考虑的状态。
4. 中文逐文件导读、调试检查清单和生产边界。

## 5. 给同事的五分钟讲解脚本

1. 打开订单详情页：Block 是持续可见的只读摘要。
2. 打开 More actions：Action 是一个有明确提交/取消按钮的 modal。
3. 返回订单列表并选择多条订单：Selection Action 收到 `data.selected` 数组。
4. 指出三个入口都使用同一套资源 ID 读取和状态处理，但交互目标不同。
5. 打开 `shared/logistics.ts`：mock 可以替换成同域 `fetch()`，真实 token 校验始终在 backend。
