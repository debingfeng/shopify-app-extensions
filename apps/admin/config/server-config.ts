import { readFileSync } from "node:fs";
import { join } from "node:path";

import { validateBackendApiBase } from "@/config/backend-api-base";
import type { AppConfig } from "@/config/runtime-config";

let fileConfig: Partial<AppConfig> | null = null;
type ServerConfigKey = keyof AppConfig;

function readEnvValue(key: ServerConfigKey): string {
  return process.env[key] || process.env[`NEXT_PUBLIC_${key}`] || "";
}

function readFileConfig(): Partial<AppConfig> {
  if (fileConfig) return fileConfig;

  try {
    const raw = readFileSync(
      join(process.cwd(), "public", "conf", "config.json"),
      "utf-8",
    );
    fileConfig = JSON.parse(raw) as Partial<AppConfig>;
  } catch {
    fileConfig = {};
  }

  return fileConfig;
}

export function getServerConfigValue(key: ServerConfigKey): string {
  const envValue = readEnvValue(key);
  if (envValue) return envValue;

  const fileValue = readFileConfig()[key];
  return typeof fileValue === "string" ? fileValue : "";
}

export function getServerAppConfig(): AppConfig {
  const config = {
    SHOPIFY_API_KEY: getServerConfigValue("SHOPIFY_API_KEY"),
    BACKEND_API_BASE: getServerConfigValue("BACKEND_API_BASE"),
    PLATFORM_API_BASE: getServerConfigValue("PLATFORM_API_BASE"),
    APP_NAME: getServerConfigValue("APP_NAME"),
    APP_ORIGINS: getServerConfigValue("APP_ORIGINS"),
  };

  validateBackendApiBase(config.BACKEND_API_BASE, {
    source: "BACKEND_API_BASE",
  });

  return config;
}
