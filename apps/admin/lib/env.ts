import { runtimeConfig } from "@/config/runtime-config";

const isServer = typeof window === "undefined";

function serverEnv(key: string): string {
  return process.env[key] || process.env[`NEXT_PUBLIC_${key}`] || "";
}

export const env = {
  get SHOPIFY_API_KEY(): string {
    if (isServer) return serverEnv("SHOPIFY_API_KEY");
    return runtimeConfig.get().SHOPIFY_API_KEY;
  },
  get BACKEND_API_BASE(): string {
    if (isServer) return serverEnv("BACKEND_API_BASE");
    return runtimeConfig.get().BACKEND_API_BASE;
  },
  get PLATFORM_API_BASE(): string {
    if (isServer) return serverEnv("PLATFORM_API_BASE");
    return runtimeConfig.get().PLATFORM_API_BASE;
  },
  get APP_NAME(): string {
    if (isServer) return serverEnv("APP_NAME");
    return runtimeConfig.get().APP_NAME;
  },
  get APP_ORIGINS(): string {
    if (isServer) return serverEnv("APP_ORIGINS");
    return runtimeConfig.get().APP_ORIGINS;
  },
};
