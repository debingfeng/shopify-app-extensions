import { isToastCapable } from "@/lib/shopify/types";

type ToastListener = (message: string) => void;

let listener: ToastListener | null = null;
const pendingQueue: string[] = [];

export function registerPolarisToastListener(next: ToastListener) {
  listener = next;
  if (pendingQueue.length > 0) {
    const pending = pendingQueue.splice(0, pendingQueue.length);
    pending.forEach((message) => next(message));
  }
  return () => {
    if (listener === next) {
      listener = null;
    }
  };
}

export function showToast(shopify: unknown, message: string) {
  if (isToastCapable(shopify)) {
    shopify.toast?.show?.(message);
    return;
  }

  if (listener) {
    listener(message);
    return;
  }

  pendingQueue.push(message);
}
