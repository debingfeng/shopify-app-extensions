# Admin UI Extension Logistics Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在当前 Shopify App 模板中加入一套中文 Admin UI Extension 技术文档和可运行的订单物流三件套学习 demo。

**Architecture:** 根仓库继续负责 Shopify App 配置和 workspace 编排；`extensions/admin-ui-logistics-demo` 是独立的 `ui_extension` workspace，三个 target 共享上下文读取与物流适配层。无真实后端时使用确定性 mock，真实调用通过同域 `fetch()` 预留接口，并在文档中说明 ID Token、后端校验和生产边界。

**Tech Stack:** Shopify CLI Admin UI Extension API `2026-07`, Preact, TypeScript/TSX, Shopify Web Components, TOML, pnpm workspace, Vitest/Node 脚本。

---

### Task 1: 建立 extension workspace 和 Shopify target 配置

**Files:**
- Create: `extensions/admin-ui-logistics-demo/package.json`
- Create: `extensions/admin-ui-logistics-demo/tsconfig.json`
- Create: `extensions/admin-ui-logistics-demo/shopify.d.ts`
- Create: `extensions/admin-ui-logistics-demo/shopify.extension.toml`
- Create: `extensions/admin-ui-logistics-demo/README.md`
- Modify: `extensions/README.md`

- [ ] **Step 1: Write the workspace metadata**

`package.json` declares a private package with `build` and `typecheck` scripts. The package must depend on `preact` and use the repository TypeScript version through the workspace.

- [ ] **Step 2: Add extension configuration**

Use `api_version = "2026-07"`, `type = "ui_extension"`, a stable handle `admin-ui-logistics-demo`, a generated-looking stable uid, and these exact targets:

```toml
[[extensions.targeting]]
target = "admin.order-details.block.render"
module = "./src/order-details-block.tsx"

[[extensions.targeting]]
target = "admin.order-details.action.render"
module = "./src/order-details-action.tsx"

[[extensions.targeting]]
target = "admin.order-index.selection-action.render"
module = "./src/order-index-selection-action.tsx"
```

- [ ] **Step 3: Add local TypeScript declarations**

Declare the `shopify` global with the subset used by the demo (`data.selected`, `close`, `query`, `auth.idToken`, `navigation.navigate`) and JSX intrinsic elements as permissive `any` types so local type checking does not depend on Shopify CLI generated files.

- [ ] **Step 4: Run workspace discovery**

Run `pnpm build:extensions` and confirm the new workspace is discovered. If Shopify CLI compilation is unavailable, record the exact limitation in the extension README and keep TypeScript verification available.

### Task 2: Implement shared context and deterministic logistics adapter

**Files:**
- Create: `extensions/admin-ui-logistics-demo/src/shared/context.ts`
- Create: `extensions/admin-ui-logistics-demo/src/shared/logistics.ts`
- Create: `extensions/admin-ui-logistics-demo/src/shared/ui.ts`

- [ ] **Step 1: Define context helpers**

Implement `getSelectedIds()` to map `shopify.data.selected` to non-empty IDs and `getFirstSelectedId()` for detail targets. Do not parse the browser URL.

- [ ] **Step 2: Define logistics domain types and mock**

Create `LogisticsStatus`, `ShipmentSummary`, and `BatchSyncResult` types. Implement deterministic mock functions based on the last characters of the resource ID so the same order always produces the same status. Add `getShipment(orderId)` and `syncShipments(orderIds)` with a small promise delay, empty-input validation, and partial-failure results.

- [ ] **Step 3: Define display helpers**

Implement status labels and a safe ID shortening helper. Keep all UI strings in the demo source so the teaching path is easy to follow; document how to extract them into locales later.

- [ ] **Step 4: Run TypeScript**

Run `pnpm --filter ./extensions/admin-ui-logistics-demo typecheck`; expected result is PASS after the target entry files exist in Task 3.

### Task 3: Implement the order details Block

**Files:**
- Create: `extensions/admin-ui-logistics-demo/src/order-details-block.tsx`

- [ ] **Step 1: Render the block entry point**

Export an async default function that calls `render(<OrderDetailsBlock />, document.body)`.

- [ ] **Step 2: Add block state flow**

Read the first selected order ID, show loading text, call `getShipment`, then render `s-admin-block`, `s-badge`, `s-text`, and `s-button`. Show a clear empty state when Shopify supplies no selected resource and a clear error state when loading fails.

- [ ] **Step 3: Add refresh behavior**

Use a button event handler to re-run the same loader, disable or label the button while loading, and keep the last successful data visible until a new result arrives.

- [ ] **Step 4: Typecheck the block**

Run the extension typecheck and confirm there are no implicit `shopify` global errors.

### Task 4: Implement the order details Action

**Files:**
- Create: `extensions/admin-ui-logistics-demo/src/order-details-action.tsx`

- [ ] **Step 1: Render an admin action modal**

Export the standard async entry point and render `s-admin-action` with a heading, selected order ID, current status, and explanatory text.

- [ ] **Step 2: Wire primary and secondary actions**

Use `shopify.close()` for cancel and after a successful sync. The primary action calls `getShipment` or `syncShipments` for the current order, exposes loading and error states, and makes repeated clicks safe while the request is pending.

- [ ] **Step 3: Keep the action focused**

Do not add arbitrary CSS or a full-page navigation flow. Add a short code comment pointing to the real backend replacement (`fetch('/api/...')`) and the ID Token verification responsibility.

### Task 5: Implement the order index Selection Action

**Files:**
- Create: `extensions/admin-ui-logistics-demo/src/order-index-selection-action.tsx`

- [ ] **Step 1: Read all selected orders**

Use `getSelectedIds()` and render the count. Show an empty selection state even though Shopify normally opens the action only after selection.

- [ ] **Step 2: Add batch sync**

Call `syncShipments(ids)`, show progress and a summary of successful/failed IDs, and preserve the failed IDs for explanation. Disable the primary action while running.

- [ ] **Step 3: Close only after the result is visible**

Keep the modal open after a partial failure so the merchant can see which items need retry; close only on explicit cancel or after a fully successful run.

### Task 6: Write the technical documentation and demo walkthrough

**Files:**
- Create: `docs/admin-ui-extensions/README.md`
- Create: `docs/admin-ui-extensions/01-learning-roadmap.md`
- Create: `docs/admin-ui-extensions/02-runtime-and-targets.md`
- Create: `docs/admin-ui-extensions/03-data-auth-and-backend.md`
- Create: `docs/admin-ui-extensions/04-local-development-and-release.md`
- Create: `docs/admin-ui-extensions/05-demo-walkthrough.md`
- Modify: `README.md`

- [ ] **Step 1: Add official source index**

Link to the Admin UI extensions overview, targets, target APIs, web components, the Admin Action tutorial, and the official Preact example repository. State that API version `2026-07` is the documentation baseline used by this demo.

- [ ] **Step 2: Explain the runtime**

Document Remote DOM, Preact entry points, Web Components, target-specific APIs, and why the extension remains small while the Embedded App/backend owns complex workflows.

- [ ] **Step 3: Explain data and auth**

Show `shopify.data.selected`, `shopify.query()`, same-origin `fetch()` with automatic ID Token injection, and cross-origin `shopify.auth.idToken()` with server verification. Include scope, least-privilege, error, timeout, idempotency, and data-minimization guidance.

- [ ] **Step 4: Explain operations**

Document CLI generation, local dev, Block pinning, target visibility, deployment, stable handle rules, API version alignment, and troubleshooting. Include a production checklist that forbids secrets in TOML/source.

- [ ] **Step 5: Add the teaching script**

Walk colleagues through the three files in order: Block for read-only context, Action for modal mutation, Selection Action for batch processing. Explain how to replace the mock adapter with a backend endpoint.

- [ ] **Step 6: Link from the repository README**

Add the Admin UI Extension learning entry and point to the demo directory and docs index.

### Task 7: Validate the finished material

**Files:**
- Test: `scripts/validate-shopify-config.test.mjs`
- Test: extension typecheck/build commands

- [ ] **Step 1: Run focused static checks**

Run:

```bash
pnpm --filter ./extensions/admin-ui-logistics-demo typecheck
pnpm build:extensions
pnpm test:shopify-config
```

Expected: extension typecheck passes; extension build either passes or reports only a documented missing Shopify CLI/runtime limitation; existing config tests pass.

- [ ] **Step 2: Run repository checks relevant to the change**

Run `pnpm check:shopify-cli-config` and `pnpm app:config:guard`. Confirm the production TOML remains unchanged and no secret-looking keys were added.

- [ ] **Step 3: Review documentation against the official pages**

Search the new docs for all target names and API method names. Confirm no obsolete target or unsupported component is presented as current.

- [ ] **Step 4: Report evidence and limitations**

Summarize passed commands, unavailable Shopify CLI operations, and the exact steps needed to run the demo against the development App client ID.
