import { access, cp, mkdir, rm } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const distDir = join(root, "dist");
const standaloneDir = join(root, ".next", "standalone");
const staticDir = join(root, ".next", "static");
const publicDir = join(root, "public");

// monorepo standalone 会把 app 内容嵌套在 apps/admin/ 下
const nestedAppDir = join(distDir, "apps", "admin");

const ensureExists = async (path) => {
  try {
    await access(path, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
};

const copyDir = async (from, to) => {
  await mkdir(to, { recursive: true });
  await cp(from, to, { recursive: true, force: true });
};

/**
 * 把 monorepo standalone 产物从 apps/admin/ 层拍平到 dist/ 根层，
 * 使产物结构与 bast Tack 单体应用保持一致：
 *   dist/server.js       ← 真实 Next.js 入口（非 shim）
 *   dist/.next/          ← server + static 产物
 *   dist/node_modules/
 *   dist/package.json
 *   dist/public/
 */
const flattenNestedApp = async () => {
  const hasNested = await ensureExists(nestedAppDir);
  if (!hasNested) return; // 已经是平铺结构，无需处理

  // 1. 将 apps/admin/.next/ 合并到 dist/.next/（覆盖同名文件）
  const nestedNext = join(nestedAppDir, ".next");
  if (await ensureExists(nestedNext)) {
    await copyDir(nestedNext, join(distDir, ".next"));
  }

  // 2. 将真实的 server.js 提升到 dist/（替换 shim 或空占位）
  const nestedServer = join(nestedAppDir, "server.js");
  if (await ensureExists(nestedServer)) {
    await cp(nestedServer, join(distDir, "server.js"), { force: true });
  }

  // 3. 将 apps/admin/package.json 提升到 dist/
  const nestedPkg = join(nestedAppDir, "package.json");
  if (await ensureExists(nestedPkg)) {
    await cp(nestedPkg, join(distDir, "package.json"), { force: true });
  }

  // 4. 删除不再需要的 apps/ 目录
  await rm(join(distDir, "apps"), { recursive: true, force: true });
};

const main = async () => {
  const hasStandalone = await ensureExists(standaloneDir);
  if (!hasStandalone) {
    throw new Error(
      "Missing .next/standalone. Ensure next.config.ts uses output: \"standalone\".",
    );
  }

  await rm(distDir, { recursive: true, force: true });
  await copyDir(standaloneDir, distDir);

  // 将 monorepo 嵌套层拍平，使 dist/ 结构与单体应用一致
  await flattenNestedApp();

  // 补充 client-side 静态资源（standalone 不含 .next/static）
  const hasStatic = await ensureExists(staticDir);
  if (hasStatic) {
    await copyDir(staticDir, join(distDir, ".next", "static"));
  }

  const hasPublic = await ensureExists(publicDir);
  if (hasPublic) {
    await copyDir(publicDir, join(distDir, "public"));
  }

  const distContents = ["server.js", "package.json", ".next", "public", "node_modules"];
  const missing = [];
  for (const entry of distContents) {
    if (!(await ensureExists(join(distDir, entry)))) {
      missing.push(entry);
    }
  }
  if (missing.length) {
    throw new Error(`dist missing required entries: ${missing.join(", ")}`);
  }
};

main();
