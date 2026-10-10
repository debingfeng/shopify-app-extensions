/**
 * Type declarations for Shopify App Bridge web components used in JSX.
 * @see https://shopify.dev/docs/api/app-bridge-library/web-components/ui-nav-menu
 */
import "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "ui-nav-menu": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}
