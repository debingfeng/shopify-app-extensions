/**
 * Polaris 国际化：
 * 把 `next-intl` 的 locale 映射到 Polaris 自带的语言包（`@shopify/polaris/locales/*`）。
 */
import type { Locale } from "@/lib/i18n/routing";
import en from "@shopify/polaris/locales/en.json";
import zhCN from "@shopify/polaris/locales/zh-CN.json";

const polarisI18nMap: Record<Locale, typeof en> = {
  en,
  "zh-CN": zhCN,
};

export function getPolarisI18n(locale: Locale) {
  return polarisI18nMap[locale] ?? en;
}
