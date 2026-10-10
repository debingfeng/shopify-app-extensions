import '@shopify/ui-extensions/preact';
import {render} from 'preact';
import {useState} from 'preact/hooks';
import {useApi, useCartLines, useInstructions, useSettings} from '@shopify/ui-extensions/checkout/preact';
import {Section, StatusBanner} from './shared/ui';

type ProtectionSettings = {protection_variant_id?: string};

export default function extension() {
  render(<Protection />, document.body);
}

function Protection() {
  const api = useApi<'purchase.checkout.reductions.render-after'>();
  const lines = useCartLines();
  const instructions = useInstructions();
  const settings = useSettings<ProtectionSettings>();
  const variantId = settings.protection_variant_id?.trim() || '';
  const protectionLine = lines.find((line) => line.merchandise.id === variantId);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function toggle() {
    if (busy || !variantId) return;
    setBusy(true); setMessage(''); setError('');
    try {
      const current = api.lines.current.find((line) => line.merchandise.id === variantId);
      const adding = !current;
      if (adding && !instructions.lines.canAddCartLine) throw new Error('Adding protection is unavailable.');
      if (!adding && !instructions.lines.canRemoveCartLine) throw new Error('Removing protection is unavailable.');
      const result = await api.applyCartLinesChange(adding
        ? {type: 'addCartLine', merchandiseId: variantId, quantity: 1}
        : {type: 'removeCartLine', id: current!.id, quantity: current!.quantity});
      if (result.type === 'error') throw new Error(result.message);
      setMessage(adding ? 'Protection enabled.' : 'Protection disabled.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Protection update failed.');
    } finally { setBusy(false); }
  }

  return <Section>
    <s-heading>Demo 08 · Protection</s-heading>
    {!variantId && <StatusBanner tone="warning" heading="Variant needed">Configure protection_variant_id in Checkout Editor.</StatusBanner>}
    {variantId && <s-text>Protection is {protectionLine ? 'enabled' : 'disabled'}.</s-text>}
    {variantId && <s-button variant={protectionLine ? 'secondary' : 'primary'} loading={busy} disabled={(!protectionLine && !instructions.lines.canAddCartLine) || (Boolean(protectionLine) && !instructions.lines.canRemoveCartLine)} onClick={() => void toggle()}>{protectionLine ? 'Disable protection' : 'Add protection'}</s-button>}
    {message && <StatusBanner tone="success" heading="Success">{message}</StatusBanner>}
    {error && <StatusBanner tone="critical" heading="Error">{error}</StatusBanner>}
    <s-text>Target: {api.extension.target}</s-text>
  </Section>;
}
