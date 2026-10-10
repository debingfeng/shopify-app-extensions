import '@shopify/ui-extensions/preact';
import {render} from 'preact';
import {useState} from 'preact/hooks';
import {
  useApi,
  useApplyAttributeChange,
  useApplyMetafieldsChange,
  useAttributes,
  useInstructions,
} from '@shopify/ui-extensions/checkout/preact';
import {Section, StatusBanner} from './shared/ui';
import {CHECKOUT_DEMO_NAMESPACE} from './shared/config';

const ATTRIBUTE_KEY = 'checkout_learning_gift_message';
const METAFIELD_KEY = 'gift_message';

export default function extension() {
  render(<GiftMessage />, document.body);
}

function GiftMessage() {
  const api = useApi<'purchase.checkout.contact.render-after'>();
  const attributes = useAttributes();
  const instructions = useInstructions();
  const applyAttributeChange = useApplyAttributeChange();
  const applyMetafieldChange = useApplyMetafieldsChange();
  const saved = attributes.find((item) => item.key === ATTRIBUTE_KEY)?.value || '';
  const [message, setMessage] = useState(saved);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  async function save() {
    if (busy) return;
    setBusy(true);
    setResult('');
    setError('');
    try {
      if (!instructions.attributes.canUpdateAttributes) {
        throw new Error('Checkout attributes are not writable in this checkout.');
      }
      const attributeResult = await applyAttributeChange({
        type: 'updateAttribute',
        key: ATTRIBUTE_KEY,
        value: message.trim(),
      });
      if (attributeResult.type === 'error') throw new Error(attributeResult.message);

      if (instructions.metafields.canSetCartMetafields) {
        const metafieldResult = await applyMetafieldChange({
          type: 'updateCartMetafield',
          metafield: {
            namespace: CHECKOUT_DEMO_NAMESPACE,
            key: METAFIELD_KEY,
            type: 'single_line_text_field',
            value: message.trim(),
          },
        });
        if (metafieldResult.type === 'error') throw new Error(metafieldResult.message);
        setResult('Gift message saved to checkout attribute and cart metafield.');
      } else {
        setResult('Gift message saved to checkout attribute. Cart metafields are unavailable.');
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Gift message could not be saved.');
    } finally {
      setBusy(false);
    }
  }

  return <Section>
    <s-heading>Demo 04 · Gift Message</s-heading>
    <s-text-area label="Gift message" value={message} onChange={(event) => setMessage((event.target as HTMLTextAreaElement).value)} />
    <s-button variant="primary" loading={busy} disabled={!message.trim() || !instructions.attributes.canUpdateAttributes} onClick={() => void save()}>Save gift message</s-button>
    {!instructions.attributes.canUpdateAttributes && <StatusBanner tone="warning" heading="Attributes unavailable">This target cannot update checkout attributes.</StatusBanner>}
    {!instructions.metafields.canSetCartMetafields && <StatusBanner tone="warning" heading="Metafields unavailable">The shop or checkout does not allow cart metafield writes.</StatusBanner>}
    {result && <StatusBanner tone="success" heading="Success">{result}</StatusBanner>}
    {error && <StatusBanner tone="critical" heading="Error">{error}</StatusBanner>}
    <s-text>Target: {api.extension.target}</s-text>
  </Section>;
}
