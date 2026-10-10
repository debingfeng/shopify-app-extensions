import '@shopify/ui-extensions/preact';
import {render} from 'preact';
import {useState} from 'preact/hooks';
import {useApi, useSettings} from '@shopify/ui-extensions/checkout/preact';
import {Section, StatusBanner} from './shared/ui';

export default function extension() {
  render(<Backend />, document.body);
}

function Backend() {
  const api = useApi<'purchase.checkout.payment-method-list.render-after'>();
  const settings = useSettings<{backend_api_url?: string}>();
  const endpoint = settings.backend_api_url?.trim() || '';
  const validEndpoint = /^https:\/\/[^\s/]+\/proxy\/checkout-learning\/session\/?$/.test(endpoint);
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function callMock() {
    if (!validEndpoint) return;
    setState('loading');
    setMessage('');
    try {
      const token = await api.sessionToken.get();
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {Authorization: `Bearer ${token}`, 'Content-Type': 'application/json'},
        body: JSON.stringify({scenario: 'backend', target: api.extension.target}),
      });
      const payload = await response.json() as {message?: string; error?: string};
      if (!response.ok) throw new Error(payload.error || `Request failed (${response.status})`);
      setMessage(payload.message || 'Mock API request succeeded.');
      setState('success');
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'Backend request failed.');
      setState('error');
    }
  }

  return <Section>
    <s-heading>Demo 06 · Backend</s-heading>
    <s-text>Session tokens are requested immediately before the network call.</s-text>
    <s-button variant="primary" loading={state === 'loading'} disabled={!validEndpoint} onClick={() => void callMock()}>Call mock API</s-button>
    {!validEndpoint && <StatusBanner tone="warning" heading="HTTPS endpoint required">Set backend_api_url to the public HTTPS tunnel URL ending in /proxy/checkout-learning/session.</StatusBanner>}
    {state === 'idle' && <StatusBanner tone="info" heading="Ready">The request has not started.</StatusBanner>}
    {state === 'loading' && <StatusBanner tone="info" heading="Loading">Requesting a token and calling the local proxy…</StatusBanner>}
    {state === 'success' && <StatusBanner tone="success" heading="Success">{message}</StatusBanner>}
    {state === 'error' && <StatusBanner tone="critical" heading="Error">{message}</StatusBanner>}
    <s-text>Target: {api.extension.target}</s-text>
  </Section>;
}
