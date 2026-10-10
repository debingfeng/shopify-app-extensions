const SHOPIFY_FRAME_ANCESTORS =
  "frame-ancestors https://admin.shopify.com https://*.shopify.com";

export function withShopifyFrameHeaders(response: Response) {
  const headers = new Headers(response.headers);
  headers.set("Content-Security-Policy", SHOPIFY_FRAME_ANCESTORS);
  headers.delete("X-Frame-Options");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
