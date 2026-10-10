/**
 * Shopify 能力（capabilities）类型 + 类型守卫。
 * 用于在运行时判断 `shopify` 对象上是否存在对应方法，避免直接访问导致异常。
 */
export type ToastCapable = {
  toast?: {
    show?: (message: string) => void;
  };
};

export type NavigationCapable = {
  navigation?: {
    redirect?: (url: string) => void;
  };
  redirect?: (url: string) => void;
};

export function isToastCapable(value: unknown): value is ToastCapable {
  if (!value || typeof value !== "object") return false;
  const toast = (value as ToastCapable).toast;
  return !!toast && typeof toast === "object" && typeof toast.show === "function";
}

export function isNavigationCapable(value: unknown): value is NavigationCapable {
  if (!value || typeof value !== "object") return false;
  const nav = (value as NavigationCapable).navigation;
  const hasNavRedirect =
    !!nav && typeof nav === "object" && typeof nav.redirect === "function";
  const hasRedirect = typeof (value as NavigationCapable).redirect === "function";
  return hasNavRedirect || hasRedirect;
}
