import type { ProxyConfig } from "../types.js";
import {
  forwardProxyRequest,
  type ForwardProxyRequestOptions,
} from "../proxy/forward.js";
import { buildUpstreamUrl } from "../proxy/upstream.js";

type ForwardProxyRequestFn = (
  options: ForwardProxyRequestOptions,
) => Promise<Response>;

export interface HandleApiProxyRequestOptions {
  config: ProxyConfig;
  forwardProxyRequest?: ForwardProxyRequestFn;
}

export function handleApiProxyRequest(
  request: Request,
  { config, forwardProxyRequest: forward = forwardProxyRequest }: HandleApiProxyRequestOptions,
) {
  return forward({
    request,
    upstreamUrl: buildUpstreamUrl(config, request.url),
    upstreamName: config.upstream,
    timeoutMs: config.timeoutMs,
  });
}
