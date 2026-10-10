import { logError } from "./logger.js";

export interface ProxyErrorLogFields {
  requestId: string;
  method: string;
  path: string;
  upstreamName: string;
  errorName: string;
  message: string;
}

export function logProxyError(fields: ProxyErrorLogFields) {
  logError("error", fields);
}
