"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

import { runtimeConfig } from "@/config/runtime-config";
import type { EmbeddedAppShellProps } from "@/components/EmbeddedAppShell.client";
import PolarisSkeletonShell from "@/components/PolarisSkeletonShell";

const EmbeddedAppShellClient = dynamic(
  () => import("./EmbeddedAppShell.client"),
  {
    ssr: false,
    loading: () => <PolarisSkeletonShell />,
  },
);

export default function EmbeddedAppShell(props: EmbeddedAppShellProps) {
  const [configReady, setConfigReady] = useState(runtimeConfig.isLoaded());

  useEffect(() => {
    if (!configReady) {
      runtimeConfig
        .load()
        .then(() => setConfigReady(true))
        .catch((err) => {
          console.error("[EmbeddedAppShell] config load failed:", err);
          setConfigReady(true);
        });
    }
  }, [configReady]);

  if (!configReady) return <PolarisSkeletonShell />;

  return <EmbeddedAppShellClient {...props} />;
}
