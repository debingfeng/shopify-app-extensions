"use client";

import type { MouseEvent } from "react";
import { useRouter } from "next/router";

import { resolveLocaleValue } from "@/lib/i18n/pages";
import { preserveHostShop } from "@/lib/shopify/url";
import enMessages from "@/messages/en.json";
import zhCNMessages from "@/messages/zh-CN.json";

const navigationMessages = {
  en: enMessages.Navigation,
  "zh-CN": zhCNMessages.Navigation,
};

type NavigationKey = keyof typeof enMessages.Navigation;

type NavItem = {
  href: string;
  labelKey: NavigationKey;
  rel?: "home";
};

const NAV_ITEMS: NavItem[] = [
  { href: "", labelKey: "dashboard", rel: "home" },
  { href: "", labelKey: "dashboard" },
  { href: "/packages", labelKey: "packages" },
  { href: "/extensions", labelKey: "extensions" },
  { href: "/capabilities", labelKey: "capabilities" },
  { href: "/help", labelKey: "help" },
];

function shouldHandleClientNavigation(event: MouseEvent<HTMLAnchorElement>) {
  return !(
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  );
}

/**
 * Shopify Admin 侧边栏导航（`<ui-nav-menu>` web component）。
 * 业务菜单项请在此处扩展。
 * @see https://shopify.dev/docs/api/app-bridge-library/web-components/ui-nav-menu
 */
export default function AppBridgeNav() {
  const router = useRouter();
  const locale = resolveLocaleValue(router.query.locale);
  const labels = navigationMessages[locale];
  const items = NAV_ITEMS.map((item) => ({
    ...item,
    href: preserveHostShop(`/${locale}${item.href}`),
    label: labels[item.labelKey],
  }));

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!shouldHandleClientNavigation(event)) return;

    const href = event.currentTarget.getAttribute("href");
    if (!href) return;

    event.preventDefault();
    void router.push(href);
  }

  return (
    <ui-nav-menu>
      {items.map((item, index) => (
        <a
          key={`${item.label}-${index}`}
          href={item.href}
          onClick={handleClick}
          rel={item.rel}
        >
          {index === 0 ? null : item.label}
        </a>
      ))}
    </ui-nav-menu>
  );
}
