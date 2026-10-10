import type { GetServerSideProps } from "next";

import { buildDefaultLocaleRedirect } from "@/lib/i18n/pages";

export const getServerSideProps: GetServerSideProps = async ({ query }) => ({
  redirect: {
    destination: buildDefaultLocaleRedirect(query),
    permanent: false,
  },
});

export default function RootRedirectPage() {
  return null;
}
