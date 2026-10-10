import '@shopify/ui-extensions/preact';
import {render} from 'preact';
import {useApi} from '@shopify/ui-extensions/checkout/preact';
import {Section, StatusBanner} from './shared/ui';

export default function extension() {
  render(<Buyer />, document.body);
}

function Buyer() {
  const api = useApi<'purchase.checkout.chat.render'>();
  const identity = api.buyerIdentity;
  const email = identity?.email.current;
  const customer = identity?.customer.current;

  return <Section>
    <s-heading>Demo 09 · Buyer</s-heading>
    {!identity && <StatusBanner tone="warning" heading="Buyer data unavailable">This extension does not have protected customer data access.</StatusBanner>}
    {identity && !email && !customer && <StatusBanner tone="info" heading="Anonymous buyer">Shopify has not exposed a logged-in customer or email.</StatusBanner>}
    {email && <s-text>Email: {email}</s-text>}
    {customer && <s-text>Customer ID: {customer.id}</s-text>}
    <s-text>Target: {api.extension.target}</s-text>
  </Section>;
}
