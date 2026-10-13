import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";

import { FLOW_ACTION_HANDLE, parseFlowActionPayload, verifyFlowActionHmac } from "./flowAction";

describe("Flow action request boundary", () => {
  const rawBody = Buffer.from('{"handle":"lab-acknowledge-note"}');
  const signature = createHmac("sha256", "test-secret").update(rawBody).digest("base64");

  it("accepts the exact signed raw body and rejects tampering", () => {
    expect(verifyFlowActionHmac(rawBody, signature, "test-secret")).toBe(true);
    expect(verifyFlowActionHmac(Buffer.from('{}'), signature, "test-secret")).toBe(false);
    expect(verifyFlowActionHmac(rawBody, signature, undefined)).toBe(false);
  });

  it("accepts only the expected handle and bounded note", () => {
    const valid = {
      handle: FLOW_ACTION_HANDLE,
      action_run_id: "run-123",
      shopify_domain: "standhigherlab.myshopify.com",
      properties: { note: "Demo note" },
    };
    expect(parseFlowActionPayload(valid)).toEqual(valid);
    expect(parseFlowActionPayload({ ...valid, handle: "another-action" })).toBeNull();
    expect(parseFlowActionPayload({ ...valid, properties: { note: "" } })).toBeNull();
    expect(parseFlowActionPayload({ ...valid, shopify_domain: "example.com" })).toBeNull();
  });
});
