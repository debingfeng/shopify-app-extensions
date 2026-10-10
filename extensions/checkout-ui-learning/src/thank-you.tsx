import '@shopify/ui-extensions/preact';
import {render} from 'preact';
import {useApi, useSettings, useSubscription} from '@shopify/ui-extensions/checkout/preact';
import {Section, StatusBanner} from './shared/ui';

export default function extension() {
  render(<ThankYou />, document.body);
}

function ThankYou() {
  const api = useApi<'purchase.thank-you.block.render'>();
  const confirmation = useSubscription(api.orderConfirmation);
  const orderId = confirmation.order.id;
  const settings = useSettings<{tracking_url?: string}>();
  const trackingUrl = settings.tracking_url?.trim();
  const hasTrackingUrl = Boolean(trackingUrl && /^https:\/\//i.test(trackingUrl));

  return <Section>
    <s-heading>Demo 11 · Thank You</s-heading>
    {!orderId && <StatusBanner tone="info" heading="Order pending">Order confirmation data is not available yet.</StatusBanner>}
    {orderId && <>
      <StatusBanner tone="success" heading="Order confirmed">Order {confirmation.number || orderId} is confirmed.</StatusBanner>
      {hasTrackingUrl && <s-link href={trackingUrl} target="_blank">Open tracking entry point</s-link>}
      {!hasTrackingUrl && <StatusBanner tone="info" heading="Tracking not configured">Set an HTTPS tracking URL in Checkout Editor to show the tracking entry point.</StatusBanner>}
      {confirmation.isFirstOrder && <s-text>Welcome to your first order with this shop.</s-text>}
    </>}
    <s-text>Target: {api.extension.target}</s-text>
  </Section>;
}
