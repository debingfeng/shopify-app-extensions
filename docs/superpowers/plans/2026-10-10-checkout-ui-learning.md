# Checkout UI Learning Demos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a runnable Shopify Checkout UI Extension learning project covering 12 independent demos with real Shopify APIs, small mock backend support, and documented verification limits.

**Architecture:** One Checkout UI Extension package owns the Checkout, Thank You, and Order Status UI targets for demos 01–09 and 11. Two Shopify Function packages own validation and discount-rule demos 10 and 12. A small local-proxy route provides only the backend mock response needed by demo 06. Shared code is limited to typed UI helpers and demo constants.

**Tech Stack:** Shopify CLI 4.9.2, API version 2026-07, Preact, TypeScript, Polaris Web Components, Shopify UI Extensions APIs, Shopify Functions, pnpm workspace, Vitest.

**Spec:** Confirmed in chat on 2026-10-10; package split is `checkout-ui-learning`, `checkout-validation-function`, and `discount-rules-function`.

## Global Constraints

- Use Shopify API version `2026-07` for new extensions unless CLI validation requires a newer stable version.
- Do not use legacy React UI Extensions or invented Shopify APIs.
- Every write operation must check capability/instruction availability and render loading, empty, error, success, and limitation states where applicable.
- Product IDs, discount codes, metafield namespaces, and settings that vary by shop must be explicit configuration values.
- No database or production service architecture is introduced.
- Every completed task ends with typecheck/build verification and its own git commit.

---

### Task 1: Shared checkout package scaffold and documentation shell

**Files:**
- Create: `extensions/checkout-ui-learning/package.json`
- Create: `extensions/checkout-ui-learning/tsconfig.json`
- Create: `extensions/checkout-ui-learning/shopify.extension.toml`
- Create: `extensions/checkout-ui-learning/src/shared/ui.tsx`
- Create: `extensions/checkout-ui-learning/src/shared/config.ts`
- Create: `docs/checkout-ui/README.md`
- Create: `docs/checkout-ui/scenarios.md`
- Modify: `extensions/README.md`
- Modify: `package.json`

**Verification:** `pnpm --filter @standhigher/checkout-ui-learning typecheck` and Shopify CLI config validation.

### Task 2: Demo 01 Banner

**Files:** `extensions/checkout-ui-learning/src/banner.tsx`, target entry in TOML, scenario documentation.

**Behavior:** Render announcement, informational banner, loading/error/empty examples, and locale-aware copy using Polaris Web Components.

**Verification:** Typecheck and extension build; document preview target and unsupported states.

### Task 3: Demo 02 Upsell

**Files:** `src/upsell.tsx`, shared cart capability helper, target/config/docs.

**Behavior:** Read cart lines, show empty/loading/error states, add a configured product variant and remove its line only when Cart API instructions and capabilities allow it.

### Task 4: Demo 03 Discount

**Files:** `src/discount.tsx`, target/config/docs.

**Behavior:** Query applied discount codes, apply and remove a user-entered code through the real discount API, and expose unsupported capability state.

### Task 5: Demo 04 Gift Message

**Files:** `src/gift-message.tsx`, target/config/docs.

**Behavior:** Edit a form, persist the message as checkout attributes, read/write a namespaced metafield when the target grants access, and show permission/plan limitations.

### Task 6: Demo 05 Shipping

**Files:** `src/shipping.tsx`, target/config/docs.

**Behavior:** Read delivery groups, addresses, and selected options using supported checkout APIs; show empty and unavailable shipping states without fabricating response fields.

### Task 7: Demo 06 Backend

**Files:** `src/backend.tsx`, `apps/local-proxy/src/handlers/checkout-demo.ts`, route wiring/tests, target/config/docs.

**Behavior:** Request a session token from the extension API, send it to a local mock endpoint, render request lifecycle states, and make the backend clearly reject missing/invalid demo input.

### Task 8: Demo 07 Settings and localization

**Files:** `src/settings.tsx`, target/config/docs, package settings declaration.

**Behavior:** Read merchant-provided extension settings, render configured copy in multiple locales, and document settings changes plus fallback behavior.

### Task 9: Demo 08 Protection

**Files:** `src/protection.tsx`, target/config/docs.

**Behavior:** Toggle a configured protection variant with idempotent cart add/remove behavior, capability checks, and duplicate/missing-line handling.

### Task 10: Demo 09 Buyer identity

**Files:** `src/buyer.tsx`, target/config/docs.

**Behavior:** Read buyer identity only when available, explain protected/anonymous states, and avoid exposing data when the shop or buyer has not granted access.

### Task 11: Demo 11 Thank You and Order Status

**Files:** `src/thank-you.tsx`, `src/order-status.tsx`, targets/config/docs.

**Behavior:** Show order confirmation data and a tracking entry point at supported Thank You and Order Status targets, with explicit target-specific empty/permission states.

### Task 12: Checkout Validation Function

**Files:** `extensions/checkout-validation-function/package.json`, `shopify.extension.toml`, `src/run.ts`, `src/run.test.ts`, docs.

**Behavior:** Validate a configured checkout condition and return localized user-facing errors using the Functions input/output contract.

### Task 13: Discount Rules Function

**Files:** `extensions/discount-rules-function/package.json`, `shopify.extension.toml`, `src/run.ts`, `src/run.test.ts`, docs.

**Behavior:** Apply a deterministic discount rule from Shopify Function input, return no-discount and discount cases, and document how it composes with the Discount UI demo.

### Task 14: Root scripts, full verification, and final docs

**Files:** root `package.json`, `README.md`, `docs/checkout-ui/scenarios.md`, optional config guard updates.

**Verification:** `pnpm typecheck`, `pnpm test`, `pnpm build`, Shopify CLI extension/config validation, and a requirement checklist with verified, unverified, and plan-limited items.

