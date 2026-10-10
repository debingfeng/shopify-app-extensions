export async function handleCheckoutDemoRequest(request: Request) {
  const corsHeaders = {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "Authorization, Content-Type",
  };
  if (request.method === "OPTIONS") {
    return new Response(null, {status: 204, headers: corsHeaders});
  }
  if (request.method !== "POST") {
    return Response.json({ok: false, error: "method not allowed"}, {status: 405, headers: corsHeaders});
  }

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ") || authorization.slice(7).trim().length < 10) {
    return Response.json({ok: false, error: "missing session token"}, {status: 401, headers: corsHeaders});
  }

  let payload: unknown = {};
  try {
    payload = await request.json();
  } catch {
    return Response.json({ok: false, error: "request body must be JSON"}, {status: 400, headers: corsHeaders});
  }

  if (!payload || typeof payload !== "object" ||
      !('scenario' in payload) || payload.scenario !== "backend" ||
      !('target' in payload) || payload.target !== "purchase.checkout.payment-method-list.render-after") {
    return Response.json({ok: false, error: "invalid backend demo input"}, {status: 400, headers: corsHeaders});
  }

  return Response.json({
    ok: true,
    source: "local-proxy-checkout-demo",
    tokenReceived: true,
    echo: payload,
    message: "Mock API accepted the Checkout session token header.",
  }, {headers: corsHeaders});
}
