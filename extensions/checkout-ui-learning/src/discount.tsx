import '@shopify/ui-extensions/preact';
import {render} from 'preact';
import {useState} from 'preact/hooks';
import {
  useApi,
  useApplyDiscountCodeChange,
  useDiscountCodes,
  useInstructions,
} from '@shopify/ui-extensions/checkout/preact';
import {Section, StatusBanner} from './shared/ui';

export default function extension() {
  render(<Discount />, document.body);
}

function Discount() {
  const api = useApi<'purchase.checkout.footer.render-after'>();
  const codes = useDiscountCodes();
  const instructions = useInstructions();
  const applyChange = useApplyDiscountCodeChange();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function update(change: {type: 'addDiscountCode'; code: string} | {type: 'removeDiscountCode'; code: string}) {
    if (busy) return;
    setBusy(true);
    setMessage('');
    setError('');
    try {
      const result = await applyChange(change);
      if (result.type === 'error') throw new Error(result.message);
      setMessage(change.type === 'addDiscountCode' ? 'Discount code applied.' : 'Discount code removed.');
      if (change.type === 'addDiscountCode') setCode('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Discount update failed.');
    } finally {
      setBusy(false);
    }
  }

  const canUpdate = instructions.discounts.canUpdateDiscountCodes;
  return <Section>
    <s-heading>Demo 03 · Discount</s-heading>
    {!codes.length && <StatusBanner tone="info" heading="No discount codes">No code is currently applied.</StatusBanner>}
    {codes.map((item) => <s-stack direction="inline" gap="base" key={item.code}>
      <s-text>{item.code}</s-text>
      <s-button disabled={!canUpdate || busy} onClick={() => void update({type: 'removeDiscountCode', code: item.code})}>Remove</s-button>
    </s-stack>)}
    <s-text-field label="Discount code" value={code} onChange={(event) => setCode((event.target as HTMLInputElement).value)} />
    <s-button variant="primary" loading={busy} disabled={!canUpdate || !code.trim()} onClick={() => void update({type: 'addDiscountCode', code: code.trim()})}>Apply code</s-button>
    {!canUpdate && <StatusBanner tone="warning" heading="Discount updates unavailable">Shopify has disabled discount code changes for this checkout.</StatusBanner>}
    {message && <StatusBanner tone="success" heading="Success">{message}</StatusBanner>}
    {error && <StatusBanner tone="critical" heading="Error">{error}</StatusBanner>}
    <s-text>Target: {api.extension.target}</s-text>
  </Section>;
}
