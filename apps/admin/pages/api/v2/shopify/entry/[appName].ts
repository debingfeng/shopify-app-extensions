import type { NextApiRequest, NextApiResponse } from "next";

import { getServerConfigValue } from "@/config/server-config";
import {
  createFetchRequestFromApi,
  writeFetchResponseToApi,
} from "@/lib/api/pagesRoute";
import { forwardShopifyRequest } from "@/lib/api/forward";
import { withShopifyFrameHeaders } from "@/lib/shopify/frameHeaders";
import { maybeRewriteRedirect } from "@/lib/shopify/localeRedirect";

const REQUIRED_QUERY_KEYS = ["hmac", "shop", "timestamp"] as const;
const ORDER_ID_PARAM = "bt_order_id";
const ORDER_ID_LEGACY_PARAM = "orderId";
const ORDER_NUMBER_PARAM = "bt_order_number";
const SOURCE_PARAM = "bt_source";
const SOURCE_ORDER_DETAILS = "order_details";
const SOURCE_ORDER_INDEX = "order_index";

function getRouteAppName(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function getQueryValue(
  value: string | string[] | undefined,
  fallback: string | null = null,
) {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

function getMissingParams(request: NextApiRequest) {
  return REQUIRED_QUERY_KEYS.filter((key) => !request.query[key]);
}

function parseOrderId(raw: string | null | undefined) {
  if (!raw) return null;
  const value = raw.trim();
  if (!value) return null;

  const gidMatch = value.match(/gid:\/\/shopify\/Order\/(\d+)/i);
  if (gidMatch?.[1]) return gidMatch[1];

  const numericMatch = value.match(/^(\d+)$/);
  if (numericMatch?.[1]) return numericMatch[1];

  return null;
}

function extractOrderIdFromRequest(request: NextApiRequest) {
  const directCandidates = [
    getQueryValue(request.query.bt_order_id),
    getQueryValue(request.query.order_id),
    getQueryValue(request.query.orderId),
    getQueryValue(request.query.resource_id),
    getQueryValue(request.query.resourceId),
    getQueryValue(request.query.id),
  ];

  for (const raw of directCandidates) {
    const parsed = parseOrderId(raw);
    if (parsed) return parsed;
  }

  const ids = getQueryValue(request.query.ids);
  if (ids) {
    for (const part of ids.split(",")) {
      const parsed = parseOrderId(part);
      if (parsed) return parsed;
    }
  }

  const referer = getQueryValue(undefined, request.headers.referer ?? null);
  if (!referer) return null;

  try {
    const refererUrl = new URL(referer);
    const match = refererUrl.pathname.match(/\/orders\/(\d+)/i);
    if (match?.[1]) return match[1];
  } catch {
    return null;
  }

  return null;
}

function extractOrderNumberFromRequest(request: NextApiRequest) {
  const directCandidates = [
    getQueryValue(request.query.bt_order_number),
    getQueryValue(request.query.order_number),
    getQueryValue(request.query.orderNumber),
    getQueryValue(request.query.name),
  ];

  for (const raw of directCandidates) {
    const value = raw?.trim();
    if (value) return value;
  }

  return null;
}

function inferSourceFromRequest(request: NextApiRequest) {
  const explicit = getQueryValue(request.query.bt_source)?.trim();
  if (explicit === SOURCE_ORDER_DETAILS || explicit === SOURCE_ORDER_INDEX) {
    return explicit;
  }
  if (request.query.id) return SOURCE_ORDER_DETAILS;
  if (request.query.ids) return SOURCE_ORDER_INDEX;

  const referer = request.headers.referer;
  if (!referer) return null;

  try {
    const refererUrl = new URL(referer);
    if (/\/orders\/\d+/i.test(refererUrl.pathname)) {
      return SOURCE_ORDER_DETAILS;
    }
    if (/\/orders(?:\/|$)/i.test(refererUrl.pathname)) {
      return SOURCE_ORDER_INDEX;
    }
  } catch {
    return null;
  }

  return null;
}

function appendContextToRedirect(
  response: Response,
  requestUrl: URL,
  orderId: string | null,
  orderNumber: string | null,
  source: string | null,
) {
  if (response.status < 300 || response.status >= 400) return null;

  const location = response.headers.get("location");
  if (!location) return null;

  const targetUrl = new URL(location, requestUrl.origin);
  if (orderId && !targetUrl.searchParams.get(ORDER_ID_PARAM)) {
    targetUrl.searchParams.set(ORDER_ID_PARAM, orderId);
  }
  if (orderId && !targetUrl.searchParams.get(ORDER_ID_LEGACY_PARAM)) {
    targetUrl.searchParams.set(ORDER_ID_LEGACY_PARAM, orderId);
  }
  if (orderNumber && !targetUrl.searchParams.get(ORDER_NUMBER_PARAM)) {
    targetUrl.searchParams.set(ORDER_NUMBER_PARAM, orderNumber);
  }
  if (source && !targetUrl.searchParams.get(SOURCE_PARAM)) {
    targetUrl.searchParams.set(SOURCE_PARAM, source);
  }

  const headers = new Headers(response.headers);
  headers.set("location", targetUrl.toString());

  return new Response(null, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ message: "Method not allowed." });
    return;
  }

  const appName =
    getRouteAppName(req.query.appName) || getServerConfigValue("APP_NAME");
  const missing = getMissingParams(req);

  if (missing.length > 0) {
    console.warn("[shopify-entry] missing query params", { missing });
    res.status(400).json({
      message: "Missing required query parameters.",
      missing,
    });
    return;
  }

  const request = createFetchRequestFromApi(req);
  const requestUrl = new URL(request.url);

  console.info("[shopify-entry] forward start", {
    appName,
    query: requestUrl.search,
    referer: req.headers.referer ?? null,
  });

  const response = await forwardShopifyRequest(request, {
    type: "entry",
    appName,
    redirect: "manual",
  });

  const rewritten = maybeRewriteRedirect(response, requestUrl);
  const finalResponse = rewritten ?? response;
  const orderId = extractOrderIdFromRequest(req);
  const orderNumber = extractOrderNumberFromRequest(req);
  const source = inferSourceFromRequest(req);
  const contextualResponse =
    appendContextToRedirect(
      finalResponse,
      requestUrl,
      orderId,
      orderNumber,
      source,
    ) ?? finalResponse;
  const frameSafeResponse = withShopifyFrameHeaders(contextualResponse);

  console.info("[shopify-entry] forward done", {
    appName,
    status: frameSafeResponse.status,
    source,
    orderId,
    orderNumber,
    location: frameSafeResponse.headers.get("location"),
  });

  await writeFetchResponseToApi(frameSafeResponse, res);
}
