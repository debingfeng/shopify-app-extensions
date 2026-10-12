import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";

import DemoDetailPage from "@/components/DemoDetailPage";
import { getDemoDetailProps, getDemoEntry } from "@/demos/catalog";

export const getServerSideProps: GetServerSideProps = (context) =>
  getDemoDetailProps("extensions", context);

export default function ExtensionDemoPage() {
  const router = useRouter();
  const slug = router.query.slug;
  const entry = typeof slug === "string" ? getDemoEntry("extensions", slug) : undefined;
  return entry ? <DemoDetailPage entry={entry} /> : null;
}
