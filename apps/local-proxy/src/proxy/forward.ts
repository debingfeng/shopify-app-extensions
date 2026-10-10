import { buildDownstreamResponseHeaders, buildProxyRequestHeaders } from "./headers.js";
import { logProxyError } from "../logging/error-log.js";
import {
  ensureRequestId,
  getRequestPath,
  logProxyRequest,
} from "../logging/request-log.js";

type FetchLike = typeof fetch;

export interface ForwardProxyRequestOptions {
  request: Request;
  upstreamUrl: URL;
  upstreamName: string;
  timeoutMs: number;
  fetchImpl?: FetchLike;
}

export async function forwardProxyRequest({
  request,
  upstreamUrl,
  upstreamName,
  timeoutMs,
  fetchImpl = fetch,
}: ForwardProxyRequestOptions) {
  const controller = new AbortController();
  const startedAt = Date.now();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);
  const proxyRequestHeaders = buildProxyRequestHeaders(request.headers);
  const requestId = ensureRequestId(proxyRequestHeaders);
  const method = request.method;
  const path = getRequestPath(request.url);
  let response: Response | undefined;

  try {
    const upstreamResponse = await fetchImpl(upstreamUrl, {
      method,
      headers: proxyRequestHeaders,
      body: shouldIncludeBody(method)
        ? await request.arrayBuffer()
        : undefined,
      signal: controller.signal,
      redirect: "manual",
    });

    const headers = buildDownstreamResponseHeaders(upstreamResponse.headers);
    headers.set("x-request-id", requestId);

    response = new Response(await upstreamResponse.arrayBuffer(), {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers,
    });
    return response;
  } catch (error) {
    if (isAbortError(error)) {
      logProxyError({
        requestId,
        method,
        path,
        upstreamName,
        errorName: error.name,
        message: error.message,
      });
      response = buildErrorResponse(504, "upstream timeout", requestId);
      return response;
    }

    if (isUpstreamConnectionError(error)) {
      logProxyError({
        requestId,
        method,
        path,
        upstreamName,
        errorName: error.name,
        message: error.message,
      });
      response = buildErrorResponse(502, "upstream connection failed", requestId);
      return response;
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);

    if (response) {
      logProxyRequest({
        requestId,
        method,
        path,
        upstreamName,
        upstreamUrl: upstreamUrl.toString(),
        status: response.status,
        durationMs: Date.now() - startedAt,
      });
    }
  }
}

function shouldIncludeBody(method: string) {
  return method !== "GET" && method !== "HEAD";
}

function isAbortError(error: unknown): error is DOMException {
  return error instanceof DOMException && error.name === "AbortError";
}

function isUpstreamConnectionError(error: unknown): error is TypeError {
  if (!(error instanceof TypeError) || error.message !== "fetch failed") {
    return false;
  }

  const causeCode = getErrorCauseCode(error);
  return typeof causeCode === "string" && NETWORK_ERROR_CODES.has(causeCode);
}

const NETWORK_ERROR_CODES = new Set([
  "ECONNREFUSED",
  "ECONNRESET",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "ENOTFOUND",
  "ETIMEDOUT",
  "EAI_AGAIN",
]);

function getErrorCauseCode(error: Error) {
  if (
    typeof error.cause === "object" &&
    error.cause !== null &&
    "code" in error.cause
  ) {
    return error.cause.code;
  }

  return undefined;
}

function buildErrorResponse(status: number, error: string, requestId: string) {
  return new Response(
    JSON.stringify({
      ok: false,
      service: "local-proxy",
      error,
    }),
    {
      status,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "x-request-id": requestId,
      },
    },
  );
}
