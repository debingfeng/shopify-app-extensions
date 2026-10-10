import type { ParsedUrlQuery } from "node:querystring";
import type { GetServerSidePropsContext } from "next";
import type { AbstractIntlMessages } from "next-intl";

import { isLocale, routing, type Locale } from "@/lib/i18n/routing";

const messageLoaders: Record<Locale, () => Promise<{ default: AbstractIntlMessages }>> = {
  en: () => import("../../messages/en.json"),
  "zh-CN": () => import("../../messages/zh-CN.json"),
};

export function resolveLocaleValue(value: string | string[] | undefined): Locale {
  const candidate = Array.isArray(value) ? value[0] : value;
  return typeof candidate === "string" && isLocale(candidate)
    ? candidate
    : routing.defaultLocale;
}

export async function loadLocaleMessages(locale: Locale) {
  return (await messageLoaders[locale]()).default;
}

export async function getLocalePageProps(context: GetServerSidePropsContext) {
  const locale = resolveLocaleValue(context.params?.locale);
  const messages = await loadLocaleMessages(locale);

  return {
    props: {
      locale,
      messages,
    },
  };
}

export function buildDefaultLocaleRedirect(
  query: ParsedUrlQuery,
  locale: Locale = routing.defaultLocale,
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (typeof value === "string") {
      params.set(key, value);
      continue;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
    }
  }

  const suffix = params.toString();
  return `/${locale}${suffix ? `?${suffix}` : ""}`;
}
