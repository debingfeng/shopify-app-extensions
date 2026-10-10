export async function handleCheckoutDemoRequest(request: Request) {
  if (request.method !== "POST") {
    return Response.json({ok: false, error: "method not allowed"}, {status: 405});
  }

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ") || authorization.slice(7).trim().length < 10) {
    return Response.json({ok: false, error: "missing session token"}, {status: 401});
  }

  let payload: unknown = {};
  try {
    payload = await request.json();
  } catch {
    return Response.json({ok: false, error: "request body must be JSON"}, {status: 400});
  }

  return Response.json({
    ok: true,
    source: "local-proxy-checkout-demo",
    tokenReceived: true,
    echo: payload,
    message: "Mock API accepted the Checkout session token header.",
  });
}
