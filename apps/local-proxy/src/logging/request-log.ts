import { logInfo } from "./logger.js";

const REQUEST_ID_HEADER = "x-request-id";
const FALLBACK_REQUEST_ID_HEADERS = ["x-correlation-id"] as const;

export interface ProxyRequestLogFields {
  requestId: string;
  method: string;
  path: string;
  upstreamName: string;
  upstreamUrl: string;
  status: number;
  durationMs: number;
}

export function ensureRequestId(headers: Headers) {
  const existingRequestId = readRequestId(headers);

  if (existingRequestId) {
    headers.set(REQUEST_ID_HEADER, existingRequestId);
    return existingRequestId;
  }

  const requestId = crypto.randomUUID();
  headers.set(REQUEST_ID_HEADER, requestId);
  return requestId;
}

export function logProxyRequest(fields: ProxyRequestLogFields) {
  logInfo("request", fields);
}

export function getRequestPath(requestUrl: string) {
  return new URL(requestUrl).pathname;
}

function readRequestId(headers: Headers) {
  const primary = headers.get(REQUEST_ID_HEADER)?.trim();

  if (primary) {
    return primary;
  }

  for (const headerName of FALLBACK_REQUEST_ID_HEADERS) {
    const value = headers.get(headerName)?.trim();
    if (value) {
      return value;
    }
  }

  return null;
}
