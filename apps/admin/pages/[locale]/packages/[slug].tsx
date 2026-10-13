import type { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";

import DemoDetailPage from "@/components/DemoDetailPage";
import { getDemoDetailProps, getDemoEntry } from "@/demos/catalog";

const PolarisDataTableDemo = dynamic(
  () => import("@/demos/packages/polaris-data-table/Demo"),
  { ssr: false },
);
const ShopifyAppKitDemo = dynamic(
  () => import("@/demos/packages/shopify-app-kit/Demo"),
  { ssr: false },
);
const ChartsDemo = dynamic(
  () => import("@/demos/packages/charts/Demo"),
  { ssr: false },
);
const RichTextDemo = dynamic(
  () => import("@/demos/packages/rich-text/Demo"),
  { ssr: false },
);
const PuckPageBuilderDemo = dynamic(
  () => import("@/demos/packages/puck-page-builder/Demo"),
  { ssr: false },
);

export const getServerSideProps: GetServerSideProps = (context) =>
  getDemoDetailProps("packages", context);

export default function PackageDemoPage() {
  const router = useRouter();
  const slug = router.query.slug;
  const entry = typeof slug === "string" ? getDemoEntry("packages", slug) : undefined;
  if (!entry) return null;

  const demo = slug === "polaris-data-table"
    ? <PolarisDataTableDemo />
    : slug === "shopify-app-kit"
      ? <ShopifyAppKitDemo />
      : slug === "charts"
        ? <ChartsDemo />
        : slug === "rich-text"
          ? <RichTextDemo />
          : slug === "puck-page-builder"
            ? <PuckPageBuilderDemo />
      : null;
  return <DemoDetailPage entry={entry}>{demo}</DemoDetailPage>;
}
