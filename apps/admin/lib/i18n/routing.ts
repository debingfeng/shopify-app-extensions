/**
 * i18n 路由配置：
 * 定义可用 locale 与默认 locale，并提供 `isLocale` 运行时校验。
 */
export const routing = {
  locales: ["en", "zh-CN"] as const,
  defaultLocale: "en" as const,
};

export type Locale = (typeof routing.locales)[number];

export function isLocale(value: string): value is Locale {
  return routing.locales.includes(value as Locale);
}
