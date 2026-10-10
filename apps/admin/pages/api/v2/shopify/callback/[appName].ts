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

function getMissingParams(request: NextApiRequest) {
  return REQUIRED_QUERY_KEYS.filter((key) => !request.query[key]);
}

function getRouteAppName(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
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
    console.warn("[shopify-callback] missing query params", { missing });
    res.status(400).json({
      message: "Missing required query parameters.",
      missing,
    });
    return;
  }

  const request = createFetchRequestFromApi(req);

  console.info("[shopify-callback] forward start", {
    appName,
    query: new URL(request.url).search,
  });

  const response = await forwardShopifyRequest(request, {
    type: "callback",
    appName,
    redirect: "manual",
  });

  const rewritten = maybeRewriteRedirect(response, new URL(request.url));
  const finalResponse = withShopifyFrameHeaders(rewritten ?? response);

  console.info("[shopify-callback] forward done", {
    appName,
    status: finalResponse.status,
  });

  await writeFetchResponseToApi(finalResponse, res);
}
