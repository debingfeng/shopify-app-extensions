import type { AppProps } from "next/app";
import type { AbstractIntlMessages } from "next-intl";

import AppBridgeNavLazy from "@/components/AppBridgeNavLazy";
import EmbeddedAppShell from "@/components/EmbeddedAppShell";
import type { Locale } from "@/lib/i18n/routing";
import "../styles/globals.css";
import "@shopify/polaris/build/esm/styles.css";
import "@standhigher/shopify-rich-text-editor/styles.css";

type LocalePageProps = {
  locale?: Locale;
  messages?: AbstractIntlMessages;
};

function isLocalePage(pathname: string) {
  return pathname === "/[locale]" || pathname.startsWith("/[locale]/");
}

export default function App({
  Component,
  pageProps,
  router,
}: AppProps<LocalePageProps>) {
  if (
    !isLocalePage(router.pathname) ||
    !pageProps.locale ||
    !pageProps.messages
  ) {
    return <Component {...pageProps} />;
  }

  return (
    <>
      <AppBridgeNavLazy />
      <EmbeddedAppShell
        locale={pageProps.locale}
        messages={pageProps.messages}
      >
        <Component {...pageProps} />
      </EmbeddedAppShell>
    </>
  );
}
