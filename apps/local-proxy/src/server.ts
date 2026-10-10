import {
  createServer,
  type Server,
  type ServerResponse,
  type IncomingMessage,
} from "node:http";
import { Buffer } from "node:buffer";
import { pathToFileURL } from "node:url";

import { getProxyConfig } from "./config.js";
import { logProxyError } from "./logging/error-log.js";
import { ensureRequestId, getRequestPath } from "./logging/request-log.js";
import { handleRoute } from "./routes.js";
import type { ProxyConfig } from "./types.js";

export function createProxyServer(config: ProxyConfig = getProxyConfig()): Server {
  return createServer((request, response) => {
    void handleRequest(request, response, config).catch((error) => {
      if (response.headersSent) {
        response.end();
        return;
      }

      const headers = toFetchHeaders(request);
      const requestId = ensureRequestId(headers);
      const origin = getRequestOrigin(headers);
      const path = getRequestPath(new URL(request.url ?? "/", origin).toString());

      logProxyError({
        requestId,
        method: request.method ?? "GET",
        path,
        upstreamName: "local-proxy",
        errorName: getErrorName(error),
        message: getErrorMessage(error),
      });

      response.writeHead(500, {
        "content-type": "application/json; charset=utf-8",
        "x-request-id": requestId,
      });
      response.end(
        JSON.stringify({
          ok: false,
          service: "local-proxy",
          error: "internal proxy error",
        }),
      );
    });
  });
}

export function startProxyServer(config: ProxyConfig = getProxyConfig()): Server {
  const server = createProxyServer(config);

  server.listen(config.port, () => {
    console.log(
      `[local-proxy] listening on :${config.port} -> ${config.upstream}:${config.upstreamBaseUrl} (${config.logLevel}, timeout=${config.timeoutMs}ms)`,
    );
  });

  return server;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startProxyServer();
}

async function handleRequest(
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
  config: ProxyConfig,
) {
  const routeResponse = await handleRoute(await toFetchRequest(request), { config });
  await writeFetchResponse(response, routeResponse);
}

async function toFetchRequest(request: IncomingMessage) {
  const headers = toFetchHeaders(request);
  const origin = getRequestOrigin(headers);
  const url = new URL(request.url ?? "/", origin);

  return new Request(url, {
    method: request.method ?? "GET",
    headers,
    body: shouldIncludeBody(request.method) ? await readRequestBody(request) : undefined,
    duplex: "half",
  } as RequestInit & { duplex: "half" });
}

function toFetchHeaders(request: IncomingMessage) {
  const headers = new Headers();

  for (const [key, value] of Object.entries(request.headers)) {
    if (typeof value === "undefined") {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(key, item);
      }
      continue;
    }

    headers.set(key, value);
  }

  return headers;
}

function getRequestOrigin(headers: Headers) {
  const protocol = headers.get("x-forwarded-proto") ?? "http";
  const host = headers.get("x-forwarded-host") ?? headers.get("host") ?? "localhost";
  return `${protocol}://${host}`;
}

async function readRequestBody(request: IncomingMessage) {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}

async function writeFetchResponse(
  response: ServerResponse<IncomingMessage>,
  routeResponse: Response,
) {
  routeResponse.headers.forEach((value, key) => {
    response.setHeader(key, value);
  });

  response.statusCode = routeResponse.status;
  response.statusMessage = routeResponse.statusText;

  if (!routeResponse.body) {
    response.end();
    return;
  }

  response.end(Buffer.from(await routeResponse.arrayBuffer()));
}

function shouldIncludeBody(method: string | undefined) {
  return method !== "GET" && method !== "HEAD";
}

function getErrorName(error: unknown) {
  return error instanceof Error ? error.name : "Error";
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "unknown error";
}
