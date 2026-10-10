#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const DEFAULT_RULES = {
  webhookApiVersion: "2026-04",
  testDomainPatterns: ["test-", "localhost", "127.0.0.1", "/dev-proxy"],
  testWebhookHostPattern: "",
  productionWebhookHostPattern: "",
};

const REQUIRED_TOPICS = ["app/uninstalled", "app/scopes_update"];
const TOPIC_SCOPE_REQUIREMENTS = {
  "orders/create": ["read_orders", "write_orders"],
  "orders/updated": ["read_orders", "write_orders"],
  "orders/delete": ["read_orders", "write_orders"],
  "products/create": ["read_products", "write_products"],
  "products/update": ["read_products", "write_products"],
  "products/delete": ["read_products", "write_products"],
  "inventory_levels/connect": ["read_inventory", "write_inventory"],
  "inventory_levels/update": ["read_inventory", "write_inventory"],
  "inventory_levels/disconnect": ["read_inventory", "write_inventory"],
};
const FORBIDDEN_KEYS = [
  "client_secret",
  "admin_api_access_token",
  "admin_api_token",
  "refresh_token",
  "shop_token",
  "access_token",
];

function stripComment(line) {
  let inQuote = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const previous = line[index - 1];

    if (char === '"' && previous !== "\\") {
      inQuote = !inQuote;
    }

    if (char === "#" && !inQuote) {
      return line.slice(0, index);
    }
  }

  return line;
}

function normalizeTomlLines(toml) {
  const lines = [];
  const rawLines = toml.split(/\r?\n/);

  for (let index = 0; index < rawLines.length; index += 1) {
    let line = stripComment(rawLines[index]).trim();
    if (!line) continue;

    const equalsIndex = line.indexOf("=");
    if (equalsIndex !== -1) {
      let valuePart = line.slice(equalsIndex + 1).trim();
      const opensArray = valuePart.startsWith("[") && !valuePart.includes("]");

      while (opensArray && index + 1 < rawLines.length) {
        index += 1;
        const nextLine = stripComment(rawLines[index]).trim();
        line = `${line} ${nextLine}`;
        valuePart = `${valuePart} ${nextLine}`;
        if (nextLine.includes("]")) break;
      }
    }

    lines.push(line);
  }

  return lines;
}

function getContainer(root, pathSegments) {
  return pathSegments.reduce((container, segment) => {
    if (!container[segment]) {
      container[segment] = {};
    }
    return container[segment];
  }, root);
}

function setValue(container, key, value) {
  container[key] = value;
}

function parseTomlValue(rawValue) {
  const value = rawValue.trim().replace(/,$/, "");

  if (value === "true") return true;
  if (value === "false") return false;

  if (value.startsWith("[") && value.endsWith("]")) {
    const body = value.slice(1, -1).trim();
    if (!body) return [];

    return body
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => item.replace(/^"|"$/g, ""));
  }

  return value.replace(/^"|"$/g, "");
}

export function parseShopifyToml(toml) {
  const root = {};
  let currentContainer = root;

  for (const line of normalizeTomlLines(toml)) {
    const arrayTableMatch = line.match(/^\[\[([^\]]+)]]$/);
    if (arrayTableMatch) {
      const pathSegments = arrayTableMatch[1].split(".");
      const parent = getContainer(root, pathSegments.slice(0, -1));
      const key = pathSegments.at(-1);
      parent[key] ??= [];
      const entry = {};
      parent[key].push(entry);
      currentContainer = entry;
      continue;
    }

    const tableMatch = line.match(/^\[([^\]]+)]$/);
    if (tableMatch) {
      currentContainer = getContainer(root, tableMatch[1].split("."));
      continue;
    }

    const assignmentMatch = line.match(/^([A-Za-z0-9_.-]+)\s*=\s*(.+)$/);
    if (!assignmentMatch) continue;

    const [, key, rawValue] = assignmentMatch;
    setValue(currentContainer, key, parseTomlValue(rawValue));
  }

  return root;
}

function collectConfiguredTopics(config) {
  return (config.webhooks?.subscriptions ?? []).flatMap((subscription) => [
    ...(subscription.topics ?? []),
    ...(subscription.compliance_topics ?? []),
  ]);
}

function collectConfiguredUris(config) {
  return (config.webhooks?.subscriptions ?? [])
    .map((subscription) => subscription.uri)
    .filter(Boolean);
}

function uriMatchesHostPattern(uri, hostPattern) {
  try {
    return new URL(uri).hostname === hostPattern;
  } catch {
    return false;
  }
}

function collectConfiguredScopes(config) {
  const requiredScopes = String(config.access_scopes?.scopes ?? "")
    .split(",")
    .map((scope) => scope.trim())
    .filter(Boolean);
  const optionalScopes = config.access_scopes?.optional_scopes ?? [];

  return new Set([...requiredScopes, ...optionalScopes]);
}

function hasForbiddenSecretKey(configText) {
  const lowerConfig = configText.toLowerCase();

  return FORBIDDEN_KEYS.find((key) =>
    new RegExp(`(^|\\n)\\s*${key}\\s*=`, "i").test(lowerConfig),
  );
}

function validateSingleConfig({ config, configText = "", fileName, rules }) {
  const errors = [];
  const forbiddenKey = hasForbiddenSecretKey(configText);

  if (forbiddenKey) {
    errors.push(`${fileName} must not contain ${forbiddenKey}.`);
  }

  if (config.embedded !== true) {
    errors.push(`${fileName} embedded must be true.`);
  }

  if (config.build?.include_config_on_deploy !== true) {
    errors.push(`${fileName} build.include_config_on_deploy must be true.`);
  }

  if (config.access_scopes?.use_legacy_install_flow !== false) {
    errors.push(
      `${fileName} access_scopes.use_legacy_install_flow must be false.`,
    );
  }

  if (config.webhooks?.api_version !== rules.webhookApiVersion) {
    errors.push(
      `${fileName} webhooks.api_version must be ${rules.webhookApiVersion}.`,
    );
  }

  const topics = collectConfiguredTopics(config);
  for (const requiredTopic of REQUIRED_TOPICS) {
    if (!topics.includes(requiredTopic)) {
      errors.push(`${fileName} must subscribe to ${requiredTopic}.`);
    }
  }

  const scopes = collectConfiguredScopes(config);
  for (const topic of topics) {
    const requiredScopes = TOPIC_SCOPE_REQUIREMENTS[topic];
    if (!requiredScopes) continue;

    const hasRequiredScope = requiredScopes.some((scope) => scopes.has(scope));
    if (!hasRequiredScope) {
      errors.push(
        `${fileName} topic ${topic} requires one of scopes: ${requiredScopes.join(", ")}.`,
      );
    }
  }

  return errors;
}

export function validateShopifyConfigPair({
  testConfig,
  productionConfig,
  testConfigText = "",
  productionConfigText = "",
  rules = {},
}) {
  const mergedRules = { ...DEFAULT_RULES, ...rules };
  const productionClientId =
    mergedRules.productionClientId || productionConfig.client_id || "";
  const errors = [
    ...validateSingleConfig({
      config: testConfig,
      configText: testConfigText,
      fileName: "shopify.app.toml",
      rules: mergedRules,
    }),
    ...validateSingleConfig({
      config: productionConfig,
      configText: productionConfigText,
      fileName: "shopify.app.production.toml",
      rules: mergedRules,
    }),
  ];

  if (productionClientId && testConfig.client_id === productionClientId) {
    errors.push("shopify.app.toml must not use the production client_id.");
  }

  if (
    testConfig.client_id &&
    productionConfig.client_id &&
    testConfig.client_id === productionConfig.client_id
  ) {
    errors.push(
      "shopify.app.toml and shopify.app.production.toml must use different client_id values.",
    );
  }

  if (
    mergedRules.testClientId &&
    testConfig.client_id !== mergedRules.testClientId
  ) {
    errors.push(
      "shopify.app.toml client_id must match SHOPIFY_TEST_CLIENT_ID.",
    );
  }

  if (
    mergedRules.productionClientId &&
    productionConfig.client_id !== mergedRules.productionClientId
  ) {
    errors.push(
      "shopify.app.production.toml client_id must match SHOPIFY_PRODUCTION_CLIENT_ID.",
    );
  }

  const productionSearchText =
    productionConfigText || JSON.stringify(productionConfig);

  for (const pattern of mergedRules.testDomainPatterns) {
    if (pattern && productionSearchText.includes(pattern)) {
      errors.push(
        `shopify.app.production.toml must not contain test domain pattern "${pattern}".`,
      );
    }
  }

  if (
    mergedRules.testWebhookHostPattern &&
    collectConfiguredUris(testConfig).some(
      (uri) => !uriMatchesHostPattern(uri, mergedRules.testWebhookHostPattern),
    )
  ) {
    errors.push(
      `shopify.app.toml webhook URI hostnames must match ${mergedRules.testWebhookHostPattern}.`,
    );
  }

  if (
    mergedRules.productionWebhookHostPattern &&
    collectConfiguredUris(productionConfig).some(
      (uri) =>
        !uriMatchesHostPattern(uri, mergedRules.productionWebhookHostPattern),
    )
  ) {
    errors.push(
      `shopify.app.production.toml webhook URI hostnames must match ${mergedRules.productionWebhookHostPattern}.`,
    );
  }

  return errors;
}

function readRequiredFile(path) {
  if (!existsSync(path)) {
    throw new Error(`Missing required Shopify config file: ${path}`);
  }

  return readFileSync(path, "utf-8");
}

export function validateConfigFiles({
  rootDir = process.cwd(),
  rules = {},
} = {}) {
  const testConfigPath = resolve(rootDir, "shopify.app.toml");
  const productionConfigPath = resolve(rootDir, "shopify.app.production.toml");
  const testConfigText = readRequiredFile(testConfigPath);
  const productionConfigText = readRequiredFile(productionConfigPath);

  return validateShopifyConfigPair({
    testConfig: parseShopifyToml(testConfigText),
    productionConfig: parseShopifyToml(productionConfigText),
    testConfigText,
    productionConfigText,
    rules: {
      webhookApiVersion:
        process.env.SHOPIFY_WEBHOOK_API_VERSION ??
        DEFAULT_RULES.webhookApiVersion,
      testClientId: process.env.SHOPIFY_TEST_CLIENT_ID,
      productionClientId: process.env.SHOPIFY_PRODUCTION_CLIENT_ID,
      testWebhookHostPattern: process.env.SHOPIFY_TEST_WEBHOOK_HOST ?? "",
      productionWebhookHostPattern:
        process.env.SHOPIFY_PRODUCTION_WEBHOOK_HOST ?? "",
      ...rules,
    },
  });
}

function runCli() {
  const errors = validateConfigFiles();

  if (errors.length > 0) {
    console.error("Shopify config guard failed:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("Shopify config guard passed.");
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli();
}
