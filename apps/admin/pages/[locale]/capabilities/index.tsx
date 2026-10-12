import type { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";

import LabSectionPage from "@/components/LabSectionPage";
import { getLocalePageProps } from "@/lib/i18n/pages";

export const getServerSideProps: GetServerSideProps = getLocalePageProps;

export default function CapabilitiesPage() {
  const t = useTranslations("Capabilities");
  return <LabSectionPage title={t("title")} description={t("description")} />;
}
