import { describe, expect, it } from "vitest";

import {
  parseShopifyToml,
  validateShopifyConfigPair,
} from "./validate-shopify-config.mjs";

const baseTestToml = `
client_id = "test-client-id"
name = "BestFeed Test"
application_url = "https://test-app.example.com"
embedded = true
web_directories = ["apps/admin", "apps/local-proxy"]

[build]
include_config_on_deploy = true
automatically_update_urls_on_dev = true

[access_scopes]
scopes = "read_products,write_products"
optional_scopes = ["read_orders"]
use_legacy_install_flow = false

[auth]
redirect_urls = [
  "https://test-app.example.com/api/v2/shopify/callback/bestfeed",
]

[webhooks]
api_version = "2026-04"

[[webhooks.subscriptions]]
topics = ["app/uninstalled"]
uri = "https://test-core.example.com/api/v1/shopify/webhook/app/uninstalled/bestfeed"

[[webhooks.subscriptions]]
topics = ["app/scopes_update"]
uri = "https://test-core.example.com/api/v1/shopify/webhook/bestfeed"
`;

const baseProductionToml = baseTestToml
  .replaceAll("test-client-id", "prod-client-id")
  .replaceAll("BestFeed Test", "BestFeed")
  .replaceAll("test-app.example.com", "app.example.com")
  .replaceAll("test-core.example.com", "core.example.com")
  .replace(
    "automatically_update_urls_on_dev = true",
    "automatically_update_urls_on_dev = false",
  )
  .replace(
    'web_directories = ["apps/admin", "apps/local-proxy"]',
    'web_directories = ["apps/admin"]',
  );

function validatePair(overrides = {}) {
  const testToml = overrides.testToml ?? baseTestToml;
  const productionToml = overrides.productionToml ?? baseProductionToml;

  return validateShopifyConfigPair({
    testConfig: parseShopifyToml(testToml),
    productionConfig: parseShopifyToml(productionToml),
    testConfigText: testToml,
    productionConfigText: productionToml,
    rules: {
      productionClientId: "prod-client-id",
      webhookApiVersion: "2026-04",
      testDomainPatterns: ["test-", "localhost", "127.0.0.1", "/dev-proxy"],
      testWebhookHostPattern: "test-core.example.com",
      productionWebhookHostPattern: "core.example.com",
    },
  });
}

describe("validateShopifyConfigPair", () => {
  it("accepts valid test and production configs", () => {
    expect(validatePair()).toEqual([]);
  });

  it("rejects production config that contains test domains", () => {
    const errors = validatePair({
      productionToml: baseProductionToml.replaceAll(
        "app.example.com",
        "test-app.example.com",
      ),
    });

    expect(errors).toContain(
      'shopify.app.production.toml must not contain test domain pattern "test-".',
    );
  });

  it("rejects forbidden secret keys in either TOML", () => {
    const errors = validatePair({
      productionToml: `${baseProductionToml}\nclient_secret = "shpss_secret"\n`,
    });

    expect(errors).toContain(
      "shopify.app.production.toml must not contain client_secret.",
    );
  });

  it("rejects test config bound to the production client_id", () => {
    const errors = validatePair({
      testToml: baseTestToml.replace(
        'client_id = "test-client-id"',
        'client_id = "prod-client-id"',
      ),
    });

    expect(errors).toContain(
      "shopify.app.toml must not use the production client_id.",
    );
  });

  it("rejects test config that does not match the configured test client_id", () => {
    const errors = validateShopifyConfigPair({
      testConfig: parseShopifyToml(baseTestToml),
      productionConfig: parseShopifyToml(baseProductionToml),
      testConfigText: baseTestToml,
      productionConfigText: baseProductionToml,
      rules: {
        testClientId: "expected-test-client-id",
      },
    });

    expect(errors).toContain(
      "shopify.app.toml client_id must match SHOPIFY_TEST_CLIENT_ID.",
    );
  });

  it("rejects production config that does not match the configured production client_id", () => {
    const errors = validateShopifyConfigPair({
      testConfig: parseShopifyToml(baseTestToml),
      productionConfig: parseShopifyToml(baseProductionToml),
      testConfigText: baseTestToml,
      productionConfigText: baseProductionToml,
      rules: {
        productionClientId: "expected-prod-client-id",
      },
    });

    expect(errors).toContain(
      "shopify.app.production.toml client_id must match SHOPIFY_PRODUCTION_CLIENT_ID.",
    );
  });

  it("rejects test webhook URIs outside the test backend host", () => {
    const errors = validatePair({
      testToml: baseTestToml.replace(
        "https://test-core.example.com/api/v1/shopify/webhook/bestfeed",
        "https://core.example.com/api/v1/shopify/webhook/bestfeed",
      ),
    });

    expect(errors).toContain(
      "shopify.app.toml webhook URI hostnames must match test-core.example.com.",
    );
  });

  it("rejects production webhook URIs outside the production backend host", () => {
    const errors = validatePair({
      productionToml: baseProductionToml.replace(
        "https://core.example.com/api/v1/shopify/webhook/bestfeed",
        "https://test-core.example.com/api/v1/shopify/webhook/bestfeed",
      ),
    });

    expect(errors).toContain(
      "shopify.app.production.toml webhook URI hostnames must match core.example.com.",
    );
  });

  it("rejects legacy install flow", () => {
    const errors = validatePair({
      testToml: baseTestToml.replace(
        "use_legacy_install_flow = false",
        "use_legacy_install_flow = true",
      ),
    });

    expect(errors).toContain(
      "shopify.app.toml access_scopes.use_legacy_install_flow must be false.",
    );
  });

  it("requires app lifecycle webhook topics", () => {
    const errors = validatePair({
      productionToml: baseProductionToml.replace(
        'topics = ["app/scopes_update"]',
        'topics = ["products/create"]',
      ),
    });

    expect(errors).toContain(
      "shopify.app.production.toml must subscribe to app/scopes_update.",
    );
  });

  it("requires the project webhook api version", () => {
    const errors = validatePair({
      productionToml: baseProductionToml.replace(
        'api_version = "2026-04"',
        'api_version = "2026-01"',
      ),
    });

    expect(errors).toContain(
      "shopify.app.production.toml webhooks.api_version must be 2026-04.",
    );
  });

  it("requires scopes for known business webhook topics", () => {
    const errors = validatePair({
      testToml: baseTestToml
        .replace(
          'topics = ["app/scopes_update"]',
          'topics = ["orders/create"]',
        )
        .replace(
          'scopes = "read_products,write_products"',
          'scopes = "read_products"',
        )
        .replace('optional_scopes = ["read_orders"]', "optional_scopes = []"),
    });

    expect(errors).toContain(
      "shopify.app.toml topic orders/create requires one of scopes: read_orders, write_orders.",
    );
  });
});
