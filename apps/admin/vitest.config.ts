import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { defineConfig } from "vitest/config";

const projectDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(projectDir, "."),
      "server-only": resolve(projectDir, "./test/server-only.ts"),
    },
  },
  test: {
    include: ["**/*.test.ts"],
    environment: "node",
  },
});
