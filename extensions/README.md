# extensions 目录说明

该目录用于放置当前 Shopify App 的扩展项目。

未来可在这里新增：

- `admin-ui-logistics-demo/`
- `theme-ext/`
- `checkout-ui/`
- `function-discount/`

约定：

- 每个扩展保持独立目录
- 扩展构建与发布脚本统一由仓库根脚本编排
- Admin UI 学习 demo 的技术说明见 `docs/admin-ui-extensions/`
- 当前 workspace 的 `build` 先执行类型检查；实际 Shopify bundle 由 `shopify app dev` / `shopify app deploy` 编排
