import type { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";

import DemoListPage from "@/components/DemoListPage";
import { getLocalePageProps } from "@/lib/i18n/pages";

export const getServerSideProps: GetServerSideProps = getLocalePageProps;

export default function ExtensionsPage() {
  const t = useTranslations("Extensions");
  return <DemoListPage category="extensions" title={t("title")} description={t("description")} />;
}
