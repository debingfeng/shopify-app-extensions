import '@shopify/ui-extensions';

//@ts-ignore
declare module './src/banner.tsx' {
  const shopify: import('@shopify/ui-extensions/purchase.checkout.block.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/upsell.tsx' {
  const shopify: import('@shopify/ui-extensions/purchase.checkout.cart-line-list.render-after').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/discount.tsx' {
  const shopify: import('@shopify/ui-extensions/purchase.checkout.footer.render-after').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/gift-message.tsx' {
  const shopify: import('@shopify/ui-extensions/purchase.checkout.contact.render-after').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/shipping.tsx' {
  const shopify: import('@shopify/ui-extensions/purchase.checkout.delivery-address.render-after').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/backend.tsx' {
  const shopify: import('@shopify/ui-extensions/purchase.checkout.payment-method-list.render-after').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/settings.tsx' {
  const shopify: import('@shopify/ui-extensions/purchase.checkout.header.render-after').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/protection.tsx' {
  const shopify: import('@shopify/ui-extensions/purchase.checkout.reductions.render-after').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/buyer.tsx' {
  const shopify: import('@shopify/ui-extensions/purchase.checkout.chat.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/thank-you.tsx' {
  const shopify: import('@shopify/ui-extensions/purchase.thank-you.block.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/shared/ui.tsx' {
  const shopify:
    import('@shopify/ui-extensions/purchase.checkout.block.render').Api |
    import('@shopify/ui-extensions/purchase.checkout.cart-line-list.render-after').Api |
    import('@shopify/ui-extensions/purchase.checkout.footer.render-after').Api |
    import('@shopify/ui-extensions/purchase.checkout.contact.render-after').Api |
    import('@shopify/ui-extensions/purchase.checkout.delivery-address.render-after').Api |
    import('@shopify/ui-extensions/purchase.checkout.payment-method-list.render-after').Api |
    import('@shopify/ui-extensions/purchase.checkout.header.render-after').Api |
    import('@shopify/ui-extensions/purchase.checkout.reductions.render-after').Api |
    import('@shopify/ui-extensions/purchase.checkout.chat.render').Api |
    import('@shopify/ui-extensions/purchase.thank-you.block.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/shared/config.ts' {
  const shopify:
    import('@shopify/ui-extensions/purchase.checkout.contact.render-after').Api |
    import('@shopify/ui-extensions/purchase.checkout.payment-method-list.render-after').Api;
  const globalThis: { shopify: typeof shopify };
}
