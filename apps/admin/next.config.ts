import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const projectDir = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(projectDir, "../..");
const proxyPort = process.env.BACKEND_PORT || process.env.LOCAL_PROXY_PORT;
const devRewrites =
  process.env.NODE_ENV === "development" && proxyPort
    ? async () => [
        {
          source: "/dev-proxy/:path*",
          destination: `http://127.0.0.1:${proxyPort}/:path*`,
        },
      ]
    : undefined;

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    // Next.js 16 要求 outputFileTracingRoot 与 turbopack.root 相同，故统一指向 workspace 根。
    // standalone 产物的 apps/admin/ 嵌套层由 prepare-dist.mjs 在 postbuild 阶段手动拍平。
    root: workspaceRoot,
  },
  rewrites: devRewrites,
};

export default nextConfig;
