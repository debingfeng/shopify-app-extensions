import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();

function read(relativePath) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

function expectMatch(content, pattern, message) {
  if (!pattern.test(content)) {
    fail(message);
  }
}

function expectScript(packageJson, scriptName, expectedCommand) {
  if (packageJson.scripts?.[scriptName] !== expectedCommand) {
    fail(
      `package.json: scripts["${scriptName}"] should be "${expectedCommand}"`,
    );
  }
}

function rejectScript(packageJson, scriptName) {
  if (packageJson.scripts?.[scriptName]) {
    fail(`package.json: scripts["${scriptName}"] should be removed`);
  }
}

const packageJson = JSON.parse(read("package.json"));
const appToml = read("shopify.app.toml");
const productionToml = read("shopify.app.production.toml");
const adminWebToml = read("apps/admin/shopify.web.toml");
const proxyWebToml = read("apps/local-proxy/shopify.web.toml");

const expectedScripts = {
  "dev:proxy": "pnpm --filter ./apps/local-proxy dev",
  "dev:cli": "shopify app dev",
  "dev:admin:proxy": "pnpm dev:cli",
  "app:dev": "pnpm dev:cli",
  "app:info": "shopify app info",
  "app:info:production": "shopify app info --config production",
  "app:deploy": "shopify app deploy",
  "app:deploy:test": "shopify app deploy",
  "app:deploy:production": "shopify app deploy --config production",
  "app:config:validate": "shopify app config validate --json",
  "app:config:validate:production":
    "shopify app config validate --config production --json",
  "app:config:guard": "node scripts/validate-shopify-config.mjs",
  "test:shopify-config":
    "vitest run scripts/validate-shopify-config.test.mjs",
  "check:shopify-cli-config":
    "node scripts/validate-shopify-cli-config.mjs",
  check:
    "pnpm lint && pnpm typecheck && pnpm test && pnpm check:shopify-cli-config && pnpm test:shopify-config && pnpm app:config:guard",
};

for (const [scriptName, expectedCommand] of Object.entries(expectedScripts)) {
  expectScript(packageJson, scriptName, expectedCommand);
}

for (const scriptName of [
  "app:info:dev",
  "app:info:test",
  "app:config:validate:test",
]) {
  rejectScript(packageJson, scriptName);
}

expectMatch(
  appToml,
  /web_directories\s*=\s*\[\s*"apps\/admin"\s*,\s*"apps\/local-proxy"\s*\]/,
  'shopify.app.toml: web_directories should list "apps/admin" and "apps/local-proxy"',
);

expectMatch(
  productionToml,
  /web_directories\s*=\s*\[\s*"apps\/admin"\s*\]/,
  'shopify.app.production.toml: web_directories should only list "apps/admin"',
);

expectMatch(
  adminWebToml,
  /roles\s*=\s*\[\s*"frontend"\s*\]/,
  'apps/admin/shopify.web.toml: roles should be ["frontend"]',
);

expectMatch(
  proxyWebToml,
  /roles\s*=\s*\[\s*"backend"\s*\]/,
  'apps/local-proxy/shopify.web.toml: roles should be ["backend"]',
);

if (process.exitCode) {
  process.exit(process.exitCode);
}
