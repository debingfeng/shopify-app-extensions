import '@shopify/ui-extensions';

//@ts-ignore
declare module './src/order-index-selection-action.tsx' {
  const shopify: import('@shopify/ui-extensions/admin.order-index.selection-action.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/shared/context.ts' {
  const shopify: import('@shopify/ui-extensions/admin.order-index.selection-action.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/shared/logistics.ts' {
  const shopify: import('@shopify/ui-extensions/admin.order-index.selection-action.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/shared/ui.ts' {
  const shopify: import('@shopify/ui-extensions/admin.order-index.selection-action.render').Api;
  const globalThis: { shopify: typeof shopify };
}
