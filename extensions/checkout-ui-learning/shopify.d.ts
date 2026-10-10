import '@shopify/ui-extensions';
import '@shopify/ui-extensions/checkout';
import '@shopify/ui-extensions/preact';
import '@shopify/ui-extensions/checkout/components/components';
import '@shopify/ui-extensions/purchase.checkout.block.render';
import '@shopify/ui-extensions/purchase.checkout.cart-line-list.render-after';
import '@shopify/ui-extensions/purchase.checkout.footer.render-after';
import '@shopify/ui-extensions/purchase.checkout.contact.render-after';
import '@shopify/ui-extensions/purchase.checkout.delivery-address.render-after';

declare global {
  const shopify: import('@shopify/ui-extensions/checkout').ApiForExtension<'purchase.checkout.block.render'>;
}

export {};
