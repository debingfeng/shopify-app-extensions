import { afterEach, describe, expect, it, vi } from "vitest";

describe("forwardProxyRequest", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("forwards method, query, body, and filtered headers to the upstream", async () => {
    const { forwardProxyRequest } = await import("./forward.js");

    let capturedRequest: Request | undefined;
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const response = await forwardProxyRequest({
      request: new Request("http://proxy.test/proxy/api/products?limit=5", {
        method: "POST",
        headers: {
          host: "proxy.test",
          "content-length": "12",
          "content-type": "application/json",
          "x-request-id": "req-1",
        },
        body: JSON.stringify({ title: "Snowboard" }),
      }),
      upstreamUrl: new URL("https://upstream.test/admin/api/products?limit=5"),
      upstreamName: "local",
      timeoutMs: 500,
      fetchImpl: async (input, init) => {
        capturedRequest = new Request(input, init);
        return new Response(JSON.stringify({ ok: true }), {
          status: 201,
          headers: {
            "content-type": "application/json",
            "content-length": "999",
            "content-encoding": "gzip",
            "transfer-encoding": "chunked",
            connection: "keep-alive",
            "keep-alive": "timeout=5",
            "proxy-authenticate": "Basic realm=test",
            "proxy-authorization": "Basic abc",
            te: "trailers",
            trailer: "x-trace",
            upgrade: "websocket",
            "x-upstream": "local-proxy-test",
          },
        });
      },
    });

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ ok: true });
    expect(response.headers.get("content-length")).toBeNull();
    expect(response.headers.get("content-encoding")).toBeNull();
    expect(response.headers.get("transfer-encoding")).toBeNull();
    expect(response.headers.get("connection")).toBeNull();
    expect(response.headers.get("keep-alive")).toBeNull();
    expect(response.headers.get("proxy-authenticate")).toBeNull();
    expect(response.headers.get("proxy-authorization")).toBeNull();
    expect(response.headers.get("te")).toBeNull();
    expect(response.headers.get("trailer")).toBeNull();
    expect(response.headers.get("upgrade")).toBeNull();
    expect(response.headers.get("x-upstream")).toBe("local-proxy-test");
    expect(capturedRequest).toBeDefined();
    expect(capturedRequest?.method).toBe("POST");
    expect(capturedRequest?.url).toBe(
      "https://upstream.test/admin/api/products?limit=5",
    );
    expect(capturedRequest?.headers.get("host")).toBeNull();
    expect(capturedRequest?.headers.get("content-length")).toBeNull();
    expect(capturedRequest?.headers.get("x-request-id")).toBe("req-1");
    expect(capturedRequest?.headers.get("content-type")).toBe("application/json");
    expect(await capturedRequest?.json()).toEqual({ title: "Snowboard" });
    expect(infoSpy).toHaveBeenCalledWith("[local-proxy][request]", {
      requestId: "req-1",
      method: "POST",
      path: "/proxy/api/products",
      upstreamName: "local",
      upstreamUrl: "https://upstream.test/admin/api/products?limit=5",
      status: 201,
      durationMs: expect.any(Number),
    });
  });

  it("falls back to x-correlation-id when x-request-id is absent", async () => {
    const { forwardProxyRequest } = await import("./forward.js");

    let capturedRequest: Request | undefined;
    const response = await forwardProxyRequest({
      request: new Request("http://proxy.test/proxy/api/products", {
        headers: {
          "x-correlation-id": "corr-1",
        },
      }),
      upstreamUrl: new URL("https://upstream.test/admin/api/products"),
      upstreamName: "local",
      timeoutMs: 500,
      fetchImpl: async (input, init) => {
        capturedRequest = new Request(input, init);
        return new Response(null, { status: 200 });
      },
    });

    expect(response.status).toBe(200);
    expect(capturedRequest?.headers.get("x-request-id")).toBe("corr-1");
    expect(response.headers.get("x-request-id")).toBe("corr-1");
  });

  it("returns a gateway timeout response when the upstream times out", async () => {
    const { forwardProxyRequest } = await import("./forward.js");
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);

    const response = await forwardProxyRequest({
      request: new Request("http://proxy.test/proxy/api/slow"),
      upstreamUrl: new URL("https://upstream.test/admin/api/slow"),
      upstreamName: "test",
      timeoutMs: 10,
      fetchImpl: (_input, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("The operation was aborted.", "AbortError"));
          });
        }),
    });

    expect(response.status).toBe(504);
    expect(await response.json()).toEqual({
      ok: false,
      service: "local-proxy",
      error: "upstream timeout",
    });
    expect(errorSpy).toHaveBeenCalledWith("[local-proxy][error]", {
      requestId: expect.any(String),
      method: "GET",
      path: "/proxy/api/slow",
      upstreamName: "test",
      errorName: "AbortError",
      message: "The operation was aborted.",
    });
    expect(infoSpy).toHaveBeenCalledWith("[local-proxy][request]", {
      requestId: expect.any(String),
      method: "GET",
      path: "/proxy/api/slow",
      upstreamName: "test",
      upstreamUrl: "https://upstream.test/admin/api/slow",
      status: 504,
      durationMs: expect.any(Number),
    });
  });

  it("generates a request id and returns a bad gateway response when upstream connection fails", async () => {
    const { forwardProxyRequest } = await import("./forward.js");

    let capturedRequest: Request | undefined;
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);

    const response = await forwardProxyRequest({
      request: new Request("http://proxy.test/proxy/api/orders"),
      upstreamUrl: new URL("https://upstream.test/admin/api/orders"),
      upstreamName: "local",
      timeoutMs: 500,
      fetchImpl: async (input, init) => {
        capturedRequest = new Request(input, init);
        throw Object.assign(new TypeError("fetch failed"), {
          cause: { code: "ECONNREFUSED" },
        });
      },
    });

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      ok: false,
      service: "local-proxy",
      error: "upstream connection failed",
    });
    expect(capturedRequest?.headers.get("x-request-id")).toMatch(
      /^[0-9a-f-]{36}$/i,
    );
    expect(errorSpy).toHaveBeenCalledWith("[local-proxy][error]", {
      requestId: expect.stringMatching(/^[0-9a-f-]{36}$/i),
      method: "GET",
      path: "/proxy/api/orders",
      upstreamName: "local",
      errorName: "TypeError",
      message: "fetch failed",
    });
    expect(infoSpy).toHaveBeenCalledWith("[local-proxy][request]", {
      requestId: expect.stringMatching(/^[0-9a-f-]{36}$/i),
      method: "GET",
      path: "/proxy/api/orders",
      upstreamName: "local",
      upstreamUrl: "https://upstream.test/admin/api/orders",
      status: 502,
      durationMs: expect.any(Number),
    });
  });

  it("rethrows non-network type errors to the server fallback path", async () => {
    const { forwardProxyRequest } = await import("./forward.js");

    await expect(
      forwardProxyRequest({
        request: new Request("http://proxy.test/proxy/api/orders"),
        upstreamUrl: new URL("https://upstream.test/admin/api/orders"),
        upstreamName: "local",
        timeoutMs: 500,
        fetchImpl: async () => {
          throw new TypeError("fetch failed");
        },
      }),
    ).rejects.toThrow("fetch failed");
  });
});
