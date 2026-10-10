import { afterEach, describe, expect, it, vi } from "vitest";

const mutableEnv = process.env as Record<string, string | undefined>;

async function loadNextConfig(envValues: Record<string, string | undefined>) {
  vi.resetModules();

  for (const key of ["NODE_ENV", "BACKEND_PORT", "LOCAL_PROXY_PORT"]) {
    delete mutableEnv[key];
  }

  for (const [key, value] of Object.entries(envValues)) {
    if (value === undefined) {
      delete mutableEnv[key];
      continue;
    }

    mutableEnv[key] = value;
  }

  return (await import("./next.config")).default;
}

describe("next config rewrites", () => {
  afterEach(() => {
    vi.resetModules();
    delete mutableEnv.NODE_ENV;
    delete mutableEnv.BACKEND_PORT;
    delete mutableEnv.LOCAL_PROXY_PORT;
  });

  it("adds a dev proxy rewrite using BACKEND_PORT", async () => {
    const nextConfig = await loadNextConfig({
      NODE_ENV: "development",
      BACKEND_PORT: "4010",
    });

    expect(await nextConfig.rewrites?.()).toEqual([
      {
        source: "/dev-proxy/:path*",
        destination: "http://127.0.0.1:4010/:path*",
      },
    ]);
  });

  it("falls back to LOCAL_PROXY_PORT when BACKEND_PORT is missing", async () => {
    const nextConfig = await loadNextConfig({
      NODE_ENV: "development",
      LOCAL_PROXY_PORT: "4020",
    });

    expect(await nextConfig.rewrites?.()).toEqual([
      {
        source: "/dev-proxy/:path*",
        destination: "http://127.0.0.1:4020/:path*",
      },
    ]);
  });

  it("prefers BACKEND_PORT when both proxy ports are set", async () => {
    const nextConfig = await loadNextConfig({
      NODE_ENV: "development",
      BACKEND_PORT: "4010",
      LOCAL_PROXY_PORT: "4020",
    });

    expect(await nextConfig.rewrites?.()).toEqual([
      {
        source: "/dev-proxy/:path*",
        destination: "http://127.0.0.1:4010/:path*",
      },
    ]);
  });

  it("keeps production behavior unchanged", async () => {
    const nextConfig = await loadNextConfig({
      NODE_ENV: "production",
      BACKEND_PORT: "4010",
      LOCAL_PROXY_PORT: "4020",
    });

    expect(nextConfig.rewrites).toBeUndefined();
  });
});
