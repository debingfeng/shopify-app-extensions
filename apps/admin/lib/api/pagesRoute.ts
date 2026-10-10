import type { NextApiRequest, NextApiResponse } from "next";

function getHeaderValue(
  value: string | string[] | undefined,
  fallback: string,
) {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

export function getAbsoluteApiRequestUrl(
  request: Pick<NextApiRequest, "url" | "headers">,
) {
  const protocol = getHeaderValue(
    request.headers["x-forwarded-proto"],
    "http",
  );
  const host = getHeaderValue(
    request.headers["x-forwarded-host"] ?? request.headers.host,
    "localhost",
  );

  return new URL(request.url ?? "/", `${protocol}://${host}`).toString();
}

export function createFetchHeadersFromApi(
  headers: NextApiRequest["headers"],
) {
  const next = new Headers();

  for (const [key, value] of Object.entries(headers)) {
    if (typeof value === "undefined") continue;

    if (Array.isArray(value)) {
      value.forEach((item) => next.append(key, item));
      continue;
    }

    next.set(key, value);
  }

  return next;
}

export function createFetchRequestFromApi(
  request: Pick<NextApiRequest, "headers" | "method" | "url">,
) {
  return new Request(getAbsoluteApiRequestUrl(request), {
    method: request.method ?? "GET",
    headers: createFetchHeadersFromApi(request.headers),
  });
}

export async function writeFetchResponseToApi(
  response: Response,
  res: NextApiResponse,
) {
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  res.status(response.status);

  if (!response.body) {
    res.end();
    return;
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  res.send(buffer);
}
