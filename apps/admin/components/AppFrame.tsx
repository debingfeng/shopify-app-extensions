"use client";

import { Page } from "@shopify/polaris";

type AppFrameProps = {
  title: string;
  fullWidth?: boolean;
  children: React.ReactNode;
};

export default function AppFrame({ title, fullWidth, children }: AppFrameProps) {
  return (
    <Page title={title} fullWidth={fullWidth}>
      {children}
    </Page>
  );
}
