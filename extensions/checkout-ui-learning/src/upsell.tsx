import '@shopify/ui-extensions/preact';
import {render} from 'preact';
import {useState} from 'preact/hooks';
import {
  useApi,
  useCartLines,
  useInstructions,
  useSettings,
} from '@shopify/ui-extensions/checkout/preact';
import {Section, StatusBanner} from './shared/ui';

type UpsellSettings = {upsell_variant_id?: string};

export default function extension() {
  render(<Upsell />, document.body);
}

function Upsell() {
  const api = useApi<'purchase.checkout.cart-line-list.render-after'>();
  const lines = useCartLines();
  const instructions = useInstructions();
  const settings = useSettings<UpsellSettings>();
  const variantId = settings.upsell_variant_id?.trim() || '';
  const added = lines.find((line) => line.merchandise.id === variantId);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function changeLine(action: 'add' | 'remove') {
    if (busy) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const current = api.lines.current.find((line) => line.merchandise.id === variantId);
      if (action === 'add' && !instructions.lines.canAddCartLine) {
        throw new Error('This checkout does not permit adding cart lines.');
      }
      if (action === 'remove' && !instructions.lines.canRemoveCartLine) {
        throw new Error('This checkout does not permit removing cart lines.');
      }
      if (action === 'remove' && !current) {
        throw new Error('The upsell line is no longer in the cart.');
      }
      const result = await api.applyCartLinesChange(action === 'add'
        ? {type: 'addCartLine', merchandiseId: variantId, quantity: 1}
        : {type: 'removeCartLine', id: current!.id, quantity: current!.quantity});
      if (result.type === 'error') throw new Error(result.message);
      setMessage(action === 'add' ? 'Upsell added.' : 'Upsell removed.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Cart change failed.');
    } finally {
      setBusy(false);
    }
  }

  return <Section>
    <s-heading>Demo 02 · Upsell</s-heading>
    {!lines.length && <StatusBanner tone="info" heading="Empty cart">Add a product before testing an upsell.</StatusBanner>}
    {!variantId && <StatusBanner tone="warning" heading="Variant needed">Set upsell_variant_id in the Checkout Editor.</StatusBanner>}
    {variantId && <s-text>Configured variant: {variantId}</s-text>}
    {added && <s-text>Upsell in cart: quantity {added.quantity}</s-text>}
    {variantId && !added && <s-button loading={busy} disabled={!instructions.lines.canAddCartLine} onClick={() => void changeLine('add')}>Add upsell</s-button>}
    {added && <s-button loading={busy} disabled={!instructions.lines.canRemoveCartLine} onClick={() => void changeLine('remove')}>Remove upsell</s-button>}
    {variantId && !instructions.lines.canAddCartLine && !added && <StatusBanner tone="warning" heading="Cart restricted">Adding cart lines is unavailable here.</StatusBanner>}
    {added && !instructions.lines.canRemoveCartLine && <StatusBanner tone="warning" heading="Cart restricted">Removing cart lines is unavailable here.</StatusBanner>}
    {busy && <s-text>Updating cart…</s-text>}
    {message && <StatusBanner tone="success" heading="Success">{message}</StatusBanner>}
    {error && <StatusBanner tone="critical" heading="Error">{error}</StatusBanner>}
  </Section>;
}
