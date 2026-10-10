"use client";

import { useCallback, useEffect, useState } from "react";
import { Toast } from "@shopify/polaris";

import { registerPolarisToastListener } from "@/lib/shopify/toast";

export default function PolarisToastHost() {
  const [queue, setQueue] = useState<string[]>([]);

  const enqueue = useCallback((message: string) => {
    setQueue((prev) => [...prev, message]);
  }, []);

  useEffect(() => {
    return registerPolarisToastListener(enqueue);
  }, [enqueue]);

  const active = queue[0] ?? null;

  const handleDismiss = useCallback(() => {
    setQueue((prev) => prev.slice(1));
  }, []);

  if (!active) return null;

  return <Toast content={active} onDismiss={handleDismiss} />;
}
