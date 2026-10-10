export function handleShopifyCallbackRequest() {
  return new Response(
    JSON.stringify({
      ok: false,
      service: "local-proxy",
      error: "v4.0 未启用",
    }),
    {
      status: 501,
      headers: {
        "content-type": "application/json; charset=utf-8",
      },
    },
  );
}
