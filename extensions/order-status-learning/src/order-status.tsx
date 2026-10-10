import '@shopify/ui-extensions/preact';
import {render} from 'preact';
import {useApi, useAuthenticationState, useOrder, useSettings} from '@shopify/ui-extensions/customer-account/preact';

export default function extension() {
  render(<OrderStatus />, document.body);
}

function OrderStatus() {
  const api = useApi<'customer-account.order-status.block.render'>();
  const order = useOrder<'customer-account.order-status.block.render'>();
  const authentication = useAuthenticationState();
  const settings = useSettings<{tracking_url?: string}>();
  const trackingUrl = settings.tracking_url?.trim() || '';
  const validTrackingUrl = /^https:\/\/[^\s/]+(?:\/[^\s]*)?$/.test(trackingUrl);

  return <s-stack direction="block" gap="base">
    <s-heading>Demo 11 · Order Status</s-heading>
    {!order && <s-banner tone="info" heading="Order pending">The order is still being processed.</s-banner>}
    {order && <>
      <s-banner tone="success" heading="Order available">Order {order.name} is available on this page.</s-banner>
      {order.cancelledAt && <s-banner tone="warning" heading="Order cancelled">This order was cancelled.</s-banner>}
      {authentication === 'pre_authenticated' && <s-banner tone="info" heading="Limited access">This buyer is viewing an order link without a full customer account login.</s-banner>}
      {validTrackingUrl && <s-link href={trackingUrl} target="_blank">Open tracking entry point</s-link>}
      {!trackingUrl && <s-banner tone="info" heading="Tracking not configured">Set an HTTPS tracking URL in the editor.</s-banner>}
      {trackingUrl && !validTrackingUrl && <s-banner tone="critical" heading="Invalid tracking URL">The configured URL must use HTTPS.</s-banner>}
    </>}
    <s-text>Target: {api.extensionPoint}</s-text>
  </s-stack>;
}
