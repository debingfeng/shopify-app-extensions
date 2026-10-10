import { describe, expect, it } from "vitest";

import { validateBackendApiBase } from "./backend-api-base";

describe("validateBackendApiBase", () => {
  it("allows dev-proxy in development", () => {
    expect(() =>
      validateBackendApiBase("/dev-proxy/proxy/api", {
        nodeEnv: "development",
        source: "NEXT_PUBLIC_BACKEND_API_BASE",
      }),
    ).not.toThrow();
  });

  it("rejects dev-proxy outside development", () => {
    expect(() =>
      validateBackendApiBase("/dev-proxy/proxy/api", {
        nodeEnv: "production",
        source: "NEXT_PUBLIC_BACKEND_API_BASE",
      }),
    ).toThrow(
      "NEXT_PUBLIC_BACKEND_API_BASE must not use /dev-proxy outside local development.",
    );
  });

  it("allows absolute backend URLs outside development", () => {
    expect(() =>
      validateBackendApiBase("https://test-core.example.com", {
        nodeEnv: "production",
        source: "NEXT_PUBLIC_BACKEND_API_BASE",
      }),
    ).not.toThrow();
  });
});
