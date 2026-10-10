import type { ProxyConfig, ProxyLogLevel, ProxyUpstream } from "./types.js";

const DEFAULT_PORT = 3100;
const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_LOG_LEVEL: ProxyLogLevel = "info";
const DEFAULT_UPSTREAM: ProxyUpstream = "local";
const DEFAULT_UPSTREAM_LOCAL = "http://127.0.0.1:3000";
const DEFAULT_UPSTREAM_TEST = "https://test.example.invalid";
const VALID_LOG_LEVELS = new Set<ProxyLogLevel>([
  "debug",
  "info",
  "warn",
  "error",
]);
const VALID_UPSTREAMS = new Set<ProxyUpstream>(["local", "test"]);

function readNumber(
  value: string | undefined,
  fallback: number,
  envName: string,
): number {
  if (value === undefined || value === "") {
    return fallback;
  }

  if (!/^\d+$/.test(value)) {
    throw new TypeError(`${envName} must be a non-negative integer`);
  }

  return Number(value);
}

function readLogLevel(value: string | undefined): ProxyLogLevel {
  if (value === undefined || value === "") {
    return DEFAULT_LOG_LEVEL;
  }

  if (!VALID_LOG_LEVELS.has(value as ProxyLogLevel)) {
    throw new TypeError("PROXY_LOG_LEVEL must be one of debug, info, warn, error");
  }

  return value as ProxyLogLevel;
}

function readUpstream(value: string | undefined): ProxyUpstream {
  if (value === undefined || value === "") {
    return DEFAULT_UPSTREAM;
  }

  if (!VALID_UPSTREAMS.has(value as ProxyUpstream)) {
    throw new TypeError("PROXY_UPSTREAM must be one of local, test");
  }

  return value as ProxyUpstream;
}

function readPort(env: NodeJS.ProcessEnv): number {
  if (env.PROXY_PORT !== undefined && env.PROXY_PORT !== "") {
    return readNumber(env.PROXY_PORT, DEFAULT_PORT, "PROXY_PORT");
  }

  return readNumber(env.PORT, DEFAULT_PORT, "PORT");
}

export function getProxyConfig(env: NodeJS.ProcessEnv = process.env): ProxyConfig {
  const upstream = readUpstream(env.PROXY_UPSTREAM);
  const upstreamLocal = env.PROXY_UPSTREAM_LOCAL ?? DEFAULT_UPSTREAM_LOCAL;
  const upstreamTest = env.PROXY_UPSTREAM_TEST ?? DEFAULT_UPSTREAM_TEST;

  return {
    port: readPort(env),
    upstream,
    upstreamLocal,
    upstreamTest,
    upstreamBaseUrl: upstream === "local" ? upstreamLocal : upstreamTest,
    timeoutMs: readNumber(
      env.PROXY_TIMEOUT_MS,
      DEFAULT_TIMEOUT_MS,
      "PROXY_TIMEOUT_MS",
    ),
    logLevel: readLogLevel(env.PROXY_LOG_LEVEL),
  };
}
