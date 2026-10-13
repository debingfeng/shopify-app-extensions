import { createHmac, timingSafeEqual } from "node:crypto";

export const FLOW_ACTION_HANDLE = "lab-acknowledge-note";

export function verifyFlowActionHmac(rawBody: Buffer, header: string | undefined, secret: string | undefined) {
  if (!header || !secret) return false;
  const supplied = Buffer.from(header, "base64");
  const expected = createHmac("sha256", secret).update(rawBody).digest();
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

export type FlowActionPayload = {
  handle: string;
  action_run_id: string;
  shopify_domain: string;
  properties: { note: string };
};

export function parseFlowActionPayload(value: unknown): FlowActionPayload | null {
  if (!value || typeof value !== "object") return null;
  const payload = value as Partial<FlowActionPayload>;
  if (payload.handle !== FLOW_ACTION_HANDLE) return null;
  if (typeof payload.action_run_id !== "string" || !payload.action_run_id) return null;
  if (typeof payload.shopify_domain !== "string" || !/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(payload.shopify_domain)) return null;
  const note = payload.properties?.note;
  if (typeof note !== "string" || !note.trim() || note.length > 120) return null;
  return payload as FlowActionPayload;
}
