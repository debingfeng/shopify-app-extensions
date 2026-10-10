import { validateBackendApiBase } from "@/config/backend-api-base";

export type AppConfig = {
  SHOPIFY_API_KEY: string;
  BACKEND_API_BASE: string;
  PLATFORM_API_BASE: string;
  APP_NAME: string;
  APP_ORIGINS: string;
};

class RuntimeConfig {
  private config: AppConfig | null = null;

  private static buildTimeConfig(): AppConfig {
    const config = {
      SHOPIFY_API_KEY: process.env.NEXT_PUBLIC_SHOPIFY_API_KEY ?? "",
      BACKEND_API_BASE: process.env.NEXT_PUBLIC_BACKEND_API_BASE ?? "",
      PLATFORM_API_BASE: process.env.NEXT_PUBLIC_PLATFORM_API_BASE ?? "",
      APP_NAME: process.env.NEXT_PUBLIC_APP_NAME ?? "",
      APP_ORIGINS: process.env.NEXT_PUBLIC_APP_ORIGINS ?? "",
    };

    validateBackendApiBase(config.BACKEND_API_BASE, {
      source: "NEXT_PUBLIC_BACKEND_API_BASE",
    });

    return config;
  }

  async load(): Promise<void> {
    if (this.config) return;

    if (process.env.NODE_ENV !== "production") {
      this.config = RuntimeConfig.buildTimeConfig();
      return;
    }

    let config: AppConfig;
    try {
      const res = await fetch(`/conf/config.json?t=${Date.now()}`);
      if (!res.ok) {
        throw new Error(`Failed to load /conf/config.json: ${res.status}`);
      }
      config = (await res.json()) as AppConfig;
    } catch (err) {
      console.error(
        "[runtime-config] Failed to fetch config.json, falling back to build-time env vars:",
        err,
      );
      this.config = RuntimeConfig.buildTimeConfig();
      return;
    }

    validateBackendApiBase(config.BACKEND_API_BASE, {
      source: "BACKEND_API_BASE",
    });
    this.config = config;
  }

  get(): AppConfig {
    if (!this.config) {
      throw new Error(
        "RuntimeConfig not loaded. Call runtimeConfig.load() first.",
      );
    }
    return this.config;
  }

  isLoaded(): boolean {
    return this.config !== null;
  }
}

export const runtimeConfig = new RuntimeConfig();
