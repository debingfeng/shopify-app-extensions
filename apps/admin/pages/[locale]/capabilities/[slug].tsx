import type { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";

import DemoDetailPage from "@/components/DemoDetailPage";
import { getDemoDetailProps, getDemoEntry } from "@/demos/catalog";

const AppBridgeTokenDemo = dynamic(
  () => import("@/demos/capabilities/app-bridge-token/Demo"),
  { ssr: false },
);
const MockApiDebugDemo = dynamic(
  () => import("@/demos/capabilities/mock-api-debug/Demo"),
  { ssr: false },
);

export const getServerSideProps: GetServerSideProps = (context) =>
  getDemoDetailProps("capabilities", context);

export default function CapabilityDemoPage() {
  const router = useRouter();
  const slug = router.query.slug;
  const entry = typeof slug === "string" ? getDemoEntry("capabilities", slug) : undefined;
  if (!entry) return null;
  const demo = slug === "app-bridge-token"
    ? <AppBridgeTokenDemo />
    : slug === "mock-api-debug"
      ? <MockApiDebugDemo />
      : null;
  return <DemoDetailPage entry={entry}>{demo}</DemoDetailPage>;
}
