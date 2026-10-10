import type {ComponentChildren} from 'preact';

export function StatusBanner({
  tone,
  heading,
  children,
}: {
  tone: 'auto' | 'critical' | 'info' | 'success' | 'warning';
  heading: string;
  children: ComponentChildren;
}) {
  return <s-banner tone={tone} heading={heading}>{children}</s-banner>;
}

export function Section({children}: {children: ComponentChildren}) {
  return <s-stack direction="block" gap="base">{children}</s-stack>;
}

export function ErrorText({message}: {message: string}) {
  return <StatusBanner tone="critical" heading="Demo error">{message}</StatusBanner>;
}
