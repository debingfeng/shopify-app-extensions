import { describe, expect, it } from "vitest";

describe("buildProxyRequestHeaders", () => {
  it("drops hop-by-hop headers and keeps business headers", async () => {
    const { buildProxyRequestHeaders } = await import("./headers.js");

    const headers = buildProxyRequestHeaders(
      new Headers({
        host: "localhost:3100",
        "content-length": "123",
        connection: "keep-alive",
        "transfer-encoding": "chunked",
        "keep-alive": "timeout=5",
        "proxy-authenticate": "Basic realm=test",
        "proxy-authorization": "Basic abc",
        te: "trailers",
        trailer: "x-trace",
        upgrade: "websocket",
        "content-type": "application/json",
        "x-request-id": "abc123",
        "x-shopify-access-token": "secret",
      }),
    );

    expect(headers.get("host")).toBeNull();
    expect(headers.get("content-length")).toBeNull();
    expect(headers.get("connection")).toBeNull();
    expect(headers.get("transfer-encoding")).toBeNull();
    expect(headers.get("keep-alive")).toBeNull();
    expect(headers.get("proxy-authenticate")).toBeNull();
    expect(headers.get("proxy-authorization")).toBeNull();
    expect(headers.get("te")).toBeNull();
    expect(headers.get("trailer")).toBeNull();
    expect(headers.get("upgrade")).toBeNull();
    expect(headers.get("content-type")).toBe("application/json");
    expect(headers.get("x-request-id")).toBe("abc123");
    expect(headers.get("x-shopify-access-token")).toBe("secret");
  });

  it("strips downstream hop-by-hop transport headers before returning a response", async () => {
    const { buildDownstreamResponseHeaders } = await import("./headers.js");

    const headers = buildDownstreamResponseHeaders(
      new Headers({
        "content-type": "application/json",
        "content-encoding": "gzip",
        "content-length": "123",
        "transfer-encoding": "chunked",
        connection: "keep-alive",
        "keep-alive": "timeout=5",
        "proxy-authenticate": "Basic realm=test",
        "proxy-authorization": "Basic abc",
        te: "trailers",
        trailer: "x-trace",
        upgrade: "websocket",
        "x-upstream": "ok",
      }),
    );

    expect(headers.get("content-encoding")).toBeNull();
    expect(headers.get("content-length")).toBeNull();
    expect(headers.get("transfer-encoding")).toBeNull();
    expect(headers.get("connection")).toBeNull();
    expect(headers.get("keep-alive")).toBeNull();
    expect(headers.get("proxy-authenticate")).toBeNull();
    expect(headers.get("proxy-authorization")).toBeNull();
    expect(headers.get("te")).toBeNull();
    expect(headers.get("trailer")).toBeNull();
    expect(headers.get("upgrade")).toBeNull();
    expect(headers.get("content-type")).toBe("application/json");
    expect(headers.get("x-upstream")).toBe("ok");
  });
});
