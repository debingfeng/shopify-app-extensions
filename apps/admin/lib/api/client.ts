"use client";

import { env } from "@/lib/env";
import { ApiError } from "@/lib/api/errors";
import { reportClientError } from "@/lib/monitoring/report";
import { showToast } from "@/lib/shopify/toast";
import { triggerReauth } from "@/lib/shopify/reauth";

type ApiResponse<T> = {
  data: T;
};

type ErrorMessageKey = "reauth" | "rateLimit" | "server" | "unknown";

type ApiClientOptions = {
  getErrorMessage?: (key: ErrorMessageKey) => string;
};

const REPORT_DEDUP_MS = 60_000;
const reportCache = new Map<string, number>();

const DEFAULT_ERROR_MESSAGES: Record<ErrorMessageKey, string> = {
  reauth: "Please reauthenticate to continue.",
  rateLimit: "Too many requests. Please retry shortly.",
  server: "Server error. Please retry shortly.",
  unknown: "Something went wrong. Please try again.",
};

function shouldReport(key: string) {
  const now = Date.now();
  const last = reportCache.get(key);
  if (last && now - last < REPORT_DEDUP_MS) {
    return false;
  }
  reportCache.set(key, now);
  return true;
}

function sample(rate: number) {
  return Math.random() < rate;
}

/**
 * 创建一个带鉴权、错误处理和监控上报的接口调用客户端。
 *
 * 用法示例：
 * ```ts
 * const shopify = useShopifyAppBridge();
 * const apiFetch = createApiClient(shopify);
 *
 * // 调用后端接口时自动携带 Content-Type，处理 401/429/5xx，并上报错误
 * const result = await apiFetch<MyResponse>("/api/v1/some-endpoint");
 * ```
 *
 * 如需携带 Session Token：
 * ```ts
 * import { getAppSessionToken } from "@/lib/shopify/sessionToken";
 * const token = await getAppSessionToken(shopify);
 * const result = await apiFetch<MyResponse>("/api/v1/some-endpoint", {
 *   headers: { Authorization: `Bearer ${token}` },
 * });
 * ```
 */
export function createApiClient(shopify: unknown, options?: ApiClientOptions) {
  const getErrorMessage =
    options?.getErrorMessage ??
    ((key: ErrorMessageKey) => DEFAULT_ERROR_MESSAGES[key]);

  return async function apiFetch<T>(
    path: string,
    init?: RequestInit,
  ): Promise<T> {
    const url = `${env.BACKEND_API_BASE}${path}`;

    try {
      const response = await fetch(url, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...(init?.headers ?? {}),
        },
      });

      if (!response.ok) {
        const status = response.status;
        const code = `http_${status}`;

        if (status === 401 || status === 403) {
          showToast(shopify, getErrorMessage("reauth"));
          triggerReauth(shopify);
        } else if (status === 429) {
          showToast(shopify, getErrorMessage("rateLimit"));
          if (sample(0.1) && shouldReport(`${code}:${url}:${status}`)) {
            reportClientError({ code, message: "Rate limited", status, url });
          }
        } else if (status >= 500) {
          showToast(shopify, getErrorMessage("server"));
          if (shouldReport(`${code}:${url}:${status}`)) {
            reportClientError({ code, message: "Server error", status, url });
          }
        } else {
          showToast(shopify, getErrorMessage("unknown"));
          if (sample(0.01) && shouldReport(`${code}:${url}:${status}`)) {
            reportClientError({ code, message: "Request failed", status, url });
          }
        }

        throw new ApiError("Request failed", code, status);
      }

      const contentType = response.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        const json = (await response.json()) as ApiResponse<T> | T;
        if (json && typeof json === "object" && "data" in json) {
          return (json as ApiResponse<T>).data;
        }
        return json as T;
      }

      return (await response.text()) as unknown as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      showToast(shopify, getErrorMessage("unknown"));
      const code = "network_error";

      if (sample(0.1) && shouldReport(`${code}:${url}:network`)) {
        reportClientError({
          code,
          message: "Network error",
          url,
        });
      }

      throw new ApiError("Network error", code);
    }
  };
}
