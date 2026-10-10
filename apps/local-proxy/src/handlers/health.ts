export function handleHealthRequest() {
  return Response.json({
    ok: true,
    service: "local-proxy",
  });
}
