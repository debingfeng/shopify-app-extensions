import Document, {
  Head,
  Html,
  Main,
  NextScript,
  type DocumentContext,
  type DocumentInitialProps,
} from "next/document";

import { getServerAppConfig } from "@/config/server-config";
import { resolveLocaleValue } from "@/lib/i18n/pages";
import type { Locale } from "@/lib/i18n/routing";

type ShopifyDocumentProps = DocumentInitialProps & {
  locale: Locale;
  apiKey: string;
  appOrigins: string;
};

function resolveDocumentLocale(ctx: DocumentContext): Locale {
  const headerLocale = ctx.req?.headers["x-next-intl-locale"];
  const localeFromHeader = Array.isArray(headerLocale)
    ? headerLocale[0]
    : headerLocale;
  const localeCandidate =
    localeFromHeader ?? ctx.query.locale;

  return resolveLocaleValue(localeCandidate);
}

const PREPROCESS_HOST_SCRIPT = `(function(){var u=new URLSearchParams(location.search);if(u.get('shop'))return;var h=u.get('host');if(!h)return;try{var d=atob(h.replace(/-/g,'+').replace(/_/g,'/'));var m=d.match(/\\/store\\/([^\\/]+)/i);if(m&&m[1]){var s=m[1]+'.myshopify.com';u.set('shop',s);history.replaceState(null,'',location.pathname+'?'+u+''+location.hash)}}catch(e){}})();`;
const APP_BRIDGE_SCRIPT = `document.write('<scr'+'ipt src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></scr'+'ipt>');`;

export default class ShopifyDocument extends Document<ShopifyDocumentProps> {
  static async getInitialProps(
    ctx: DocumentContext,
  ): Promise<ShopifyDocumentProps> {
    const initialProps = await Document.getInitialProps(ctx);
    const locale = resolveDocumentLocale(ctx);
    const {
      SHOPIFY_API_KEY: apiKey,
      APP_ORIGINS: appOrigins,
    } = getServerAppConfig();

    return {
      ...initialProps,
      locale,
      apiKey,
      appOrigins,
    };
  }

  render() {
    const { locale, apiKey, appOrigins } = this.props;

    return (
      <Html lang={locale}>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          {appOrigins ? (
            <meta name="shopify-app-origins" content={appOrigins} />
          ) : null}
          {apiKey ? <meta name="shopify-api-key" content={apiKey} /> : null}
          <script
            dangerouslySetInnerHTML={{
              __html: PREPROCESS_HOST_SCRIPT,
            }}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: APP_BRIDGE_SCRIPT,
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
