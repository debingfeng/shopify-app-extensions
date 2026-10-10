const HOP_BY_HOP_HEADERS = new Set([
  "host",
  "content-length",
  "connection",
  "transfer-encoding",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "upgrade",
]);

const UPSTREAM_RESPONSE_HEADERS_TO_STRIP = new Set([
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "upgrade",
]);

export function buildProxyRequestHeaders(headers: Headers) {
  const next = new Headers();

  headers.forEach((value, key) => {
    if (HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      return;
    }

    next.append(key, value);
  });

  return next;
}

export function buildDownstreamResponseHeaders(headers: Headers) {
  const next = new Headers(headers);

  for (const header of UPSTREAM_RESPONSE_HEADERS_TO_STRIP) {
    next.delete(header);
  }

  return next;
}
