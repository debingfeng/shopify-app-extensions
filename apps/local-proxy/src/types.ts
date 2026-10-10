export type ProxyLogLevel = "debug" | "info" | "warn" | "error";
export type ProxyUpstream = "local" | "test";

export interface ProxyConfig {
  port: number;
  upstream: ProxyUpstream;
  upstreamLocal: string;
  upstreamTest: string;
  upstreamBaseUrl: string;
  timeoutMs: number;
  logLevel: ProxyLogLevel;
}

export interface ProxyHealthResponse {
  ok: true;
  service: "local-proxy";
}

export interface ProxyErrorResponse {
  ok: false;
  service: "local-proxy";
  error: string;
}
