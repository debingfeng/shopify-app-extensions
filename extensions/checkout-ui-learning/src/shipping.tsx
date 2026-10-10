import '@shopify/ui-extensions/preact';
import {render} from 'preact';
import {
  useApi,
  useDeliveryGroups,
  useSubscription,
} from '@shopify/ui-extensions/checkout/preact';
import {Section, StatusBanner} from './shared/ui';

export default function extension() {
  render(<Shipping />, document.body);
}

function Shipping() {
  const api = useApi<'purchase.checkout.delivery-address.render-after'>();
  const address = api.shippingAddress ? useSubscription(api.shippingAddress) : undefined;
  const groups = useDeliveryGroups();
  const physicalGroups = groups.filter((group) => group.isDeliveryRequired);

  return <Section>
    <s-heading>Demo 05 · Shipping</s-heading>
    {!api.shippingAddress && <StatusBanner tone="warning" heading="Address permission unavailable">This extension target does not expose protected shipping address data.</StatusBanner>}
    {api.shippingAddress && !address && <StatusBanner tone="info" heading="Address pending">Enter a shipping address to load delivery information.</StatusBanner>}
    {address && <s-stack direction="block" gap="small">
      <s-text>Country: {address.countryCode || 'Not provided'}</s-text>
      <s-text>Postal code: {address.zip || 'Not provided'}</s-text>
    </s-stack>}
    {!physicalGroups.length && <StatusBanner tone="info" heading="No delivery groups">Shipping rates are empty until Shopify has enough checkout information.</StatusBanner>}
    {physicalGroups.map((group, index) => <s-stack direction="block" gap="small" key={group.id || index}>
      <s-text>Delivery group {index + 1}: {group.deliveryOptions.length} option(s)</s-text>
      {!group.deliveryOptions.length && <s-text>No delivery options returned.</s-text>}
      {group.deliveryOptions.map((option) => <s-text key={option.handle}>
        {option.title || option.code}{group.selectedDeliveryOption?.handle === option.handle ? ' (selected)' : ''}
      </s-text>)}
    </s-stack>)}
    <s-text>Target: {api.extension.target}</s-text>
  </Section>;
}
