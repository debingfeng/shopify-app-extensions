"use client";

import dynamic from "next/dynamic";

const AppBridgeNav = dynamic(() => import("./AppBridgeNav"), { ssr: false });

export default function AppBridgeNavLazy() {
  return <AppBridgeNav />;
}
