# local-proxy baseline v4.0

## 启动

```bash
pnpm app:dev
```

直连前端时：

```bash
pnpm dev:admin
```

## 何时使用

- 代理模式：需要把前端 `/dev-proxy/proxy/api/*` 转到本地代理，再转到目标后端
- 直连模式：只做前端开发，或直接联调测试 / 生产后端
- `/dev-proxy` 只允许用于本地开发；测试和生产必须配置真实业务后端 URL

## v4.0 范围

- 只覆盖业务 API 代理
- 不接管 Shopify entry / callback
- 不做 cookie 改写

说明：`/proxy/shopify/entry/*` 和 `/proxy/shopify/callback/*` 在 v4.0 仍是占位返回，不是正式链路。

## 最小排障

- `pnpm app:dev` 场景下先确认 Shopify CLI 已注入 `BACKEND_PORT`
- 单独排查 local-proxy 时先确认 `LOCAL_PROXY_PORT` 可用
- 先访问 `http://127.0.0.1:<port>/health`，确认 local-proxy 已启动
