import type { NextApiRequest, NextApiResponse } from "next";

import { parseFlowActionPayload, verifyFlowActionHmac } from "@/lib/shopify/flowAction";

const MAX_BODY_BYTES = 16 * 1024;

export const config = { api: { bodyParser: false } };

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  response.setHeader("Cache-Control", "no-store");
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).end();
    return;
  }

  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += bytes.length;
    if (size > MAX_BODY_BYTES) {
      response.status(413).end();
      return;
    }
    chunks.push(bytes);
  }
  const rawBody = Buffer.concat(chunks);
  const hmac = request.headers["x-shopify-hmac-sha256"];
  if (!verifyFlowActionHmac(rawBody, typeof hmac === "string" ? hmac : undefined, process.env.SHOPIFY_API_SECRET)) {
    response.status(401).end();
    return;
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody.toString("utf8"));
  } catch {
    response.status(400).end();
    return;
  }
  const action = parseFlowActionPayload(payload);
  if (!action) {
    response.status(400).end();
    return;
  }

  // This learning action has no external side effect, so Flow retries are safe.
  console.info("[flow-acknowledge]", { runId: action.action_run_id, shop: action.shopify_domain });
  response.status(200).end();
}
