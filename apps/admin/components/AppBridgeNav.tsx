"use client";

import type { MouseEvent } from "react";
import { useEffect } from "react";
import { useRouter } from "next/router";

import { resolveLocaleValue } from "@/lib/i18n/pages";
import { preserveHostShop } from "@/lib/shopify/url";

type NavItem = {
  href: string;
  label: string;
  rel?: "home";
};

const NAV_ITEMS: NavItem[] = [
  { href: "", label: "Dashboard", rel: "home" as const },
  { href: "", label: "Dashboard" },
  { href: "/settings", label: "Settings" },
  { href: "/help", label: "Help" },
] as const;

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
  const items = NAV_ITEMS.map((item) => ({
    ...item,
    href: preserveHostShop(`/${locale}${item.href}`),
  }));

  useEffect(() => {
    items.forEach((item) => {
      void router.prefetch(item.href);
    });
  }, [items, router]);

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
