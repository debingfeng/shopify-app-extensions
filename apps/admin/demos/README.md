# Lab Demo 接入约定

`catalog.ts` 是三个 Lab 目录页与详情页的静态数据源。新增示例时：

1. 在相应分类数组加入一个稳定、唯一的 `slug`，填写英中标题、场景、体验方式、使用方式、运行环境和前置条件。
2. 保留现有 `pages/[locale]/<category>/[slug].tsx` 通用路由；无需为每个示例复制页面文件。
3. 可运行的交互组件放在 `demos/<category>/<slug>/`。在对应分类的 `[slug].tsx` 中显式选择组件，并作为 `DemoDetailPage` 的 children 渲染。只为确实需要的组件添加映射。
4. 状态按实际证据更新：`planned` 为尚无可运行示例，`sourceReady` 为已有源码但未验证运行，`localVerified` 为本地交互已验证，`storeVerified` 为测试店铺已验证。编译成功本身不等于店铺验证。

扩展的源码仍放在仓库根目录 `extensions/*`，Admin 详情页只负责说明和入口，不模拟扩展真实运行环境。
