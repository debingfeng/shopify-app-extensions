import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

describe("createProxyServer", () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("serves a health payload on /health", async () => {
    process.env.PROXY_PORT = "0";
    process.env.PROXY_UPSTREAM = "local";
    process.env.PROXY_UPSTREAM_LOCAL = "http://127.0.0.1:4301";
    process.env.PROXY_UPSTREAM_TEST = "https://upstream.test.example.com";

    const { createProxyServer } = await import("./server.js");

    const server = createProxyServer();
    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", () => resolve());
    });

    const address = server.address();
    if (!address || typeof address === "string") {
      throw new TypeError("expected address info");
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:${address.port.toString()}/health`,
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toMatchObject({
        ok: true,
        service: "local-proxy",
      });
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error?: Error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });
    }
  });

  it("returns 404 for non-health routes", async () => {
    const { createProxyServer } = await import("./server.js");

    const server = createProxyServer();
    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", () => resolve());
    });

    const address = server.address();
    if (!address || typeof address === "string") {
      throw new TypeError("expected address info");
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:${address.port.toString()}/missing`,
      );

      expect(response.status).toBe(404);
      expect(await response.json()).toMatchObject({
        ok: false,
        service: "local-proxy",
      });
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error?: Error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });
    }
  });

  it("consumes configuration when started without explicit arguments", async () => {
    vi.resetModules();

    process.env.PROXY_PORT = "0";
    process.env.PROXY_UPSTREAM = "test";
    process.env.PROXY_UPSTREAM_LOCAL = "http://127.0.0.1:4301";
    process.env.PROXY_UPSTREAM_TEST = "https://upstream.test.example.com";
    process.env.PROXY_TIMEOUT_MS = "2222";
    process.env.PROXY_LOG_LEVEL = "warn";

    const listenSpy = vi.fn((port: number, callback?: () => void) => {
      callback?.();
      return fakeServer;
    });
    const fakeServer = { listen: listenSpy };
    const createServerSpy = vi.fn(() => fakeServer);
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

    vi.doMock("node:http", async () => {
      const actual = await vi.importActual<typeof import("node:http")>(
        "node:http",
      );

      return {
        ...actual,
        createServer: createServerSpy,
      };
    });

    const { startProxyServer } = await import("./server.js");

    startProxyServer();

    expect(createServerSpy).toHaveBeenCalledOnce();
    expect(listenSpy).toHaveBeenCalledWith(0, expect.any(Function));
    expect(logSpy).toHaveBeenCalledWith(
      "[local-proxy] listening on :0 -> test:https://upstream.test.example.com (warn, timeout=2222ms)",
    );
  });

  it("keeps the 500 fallback envelope aligned with proxy errors", async () => {
    vi.resetModules();
    vi.doUnmock("node:http");
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.doMock("./routes.js", () => ({
      handleRoute: vi.fn(async () => {
        throw new Error("boom");
      }),
    }));

    const { createProxyServer } = await import("./server.js");

    const server = createProxyServer();
    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", () => resolve());
    });

    const address = server.address();
    if (!address || typeof address === "string") {
      throw new TypeError("expected address info");
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:${address.port.toString()}/proxy/api/fail`,
      );

      expect(response.status).toBe(500);
      expect(response.headers.get("x-request-id")).toMatch(/^[0-9a-f-]{36}$/i);
      expect(await response.json()).toEqual({
        ok: false,
        service: "local-proxy",
        error: "internal proxy error",
      });
      expect(errorSpy).toHaveBeenCalledWith("[local-proxy][error]", {
        requestId: expect.stringMatching(/^[0-9a-f-]{36}$/i),
        method: "GET",
        path: "/proxy/api/fail",
        upstreamName: "local-proxy",
        errorName: "Error",
        message: "boom",
      });
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error?: Error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });
    }
  });

  it("reuses x-request-id in the 500 fallback response and error log", async () => {
    vi.resetModules();
    vi.doUnmock("node:http");
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.doMock("./routes.js", () => ({
      handleRoute: vi.fn(async () => {
        throw new Error("boom");
      }),
    }));

    const { createProxyServer } = await import("./server.js");

    const server = createProxyServer();
    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", () => resolve());
    });

    const address = server.address();
    if (!address || typeof address === "string") {
      throw new TypeError("expected address info");
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:${address.port.toString()}/proxy/api/fail`,
        {
          headers: {
            "x-request-id": "req-server-1",
          },
        },
      );

      expect(response.status).toBe(500);
      expect(response.headers.get("x-request-id")).toBe("req-server-1");
      expect(errorSpy).toHaveBeenCalledWith("[local-proxy][error]", {
        requestId: "req-server-1",
        method: "GET",
        path: "/proxy/api/fail",
        upstreamName: "local-proxy",
        errorName: "Error",
        message: "boom",
      });
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error?: Error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });
    }
  });

  it("falls back to x-correlation-id in the 500 fallback response and error log", async () => {
    vi.resetModules();
    vi.doUnmock("node:http");
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.doMock("./routes.js", () => ({
      handleRoute: vi.fn(async () => {
        throw new Error("boom");
      }),
    }));

    const { createProxyServer } = await import("./server.js");

    const server = createProxyServer();
    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", () => resolve());
    });

    const address = server.address();
    if (!address || typeof address === "string") {
      throw new TypeError("expected address info");
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:${address.port.toString()}/proxy/api/fail`,
        {
          headers: {
            "x-correlation-id": "corr-server-1",
          },
        },
      );

      expect(response.status).toBe(500);
      expect(response.headers.get("x-request-id")).toBe("corr-server-1");
      expect(errorSpy).toHaveBeenCalledWith("[local-proxy][error]", {
        requestId: "corr-server-1",
        method: "GET",
        path: "/proxy/api/fail",
        upstreamName: "local-proxy",
        errorName: "Error",
        message: "boom",
      });
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error?: Error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });
    }
  });
});
