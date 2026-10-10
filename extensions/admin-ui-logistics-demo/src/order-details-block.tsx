import { render } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { getFirstSelectedId } from './shared/context';
import { getShipment, type ShipmentSummary } from './shared/logistics';
import { errorMessage, shortId, statusLabel } from './shared/ui';

export default async () => {
  render(<OrderDetailsBlock />, document.body);
};

function OrderDetailsBlock() {
  const orderId = getFirstSelectedId();
  const [shipment, setShipment] = useState<ShipmentSummary>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    if (!orderId || loading) return;
    setLoading(true);
    setError('');
    try {
      setShipment(await getShipment(orderId));
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [orderId]);

  return <s-admin-block heading="物流状态（教学 Demo）">
    {!orderId && <s-text>当前页面没有提供订单 ID。</s-text>}
    {orderId && <s-text>订单：{shortId(orderId)}</s-text>}
    {loading && <s-text>正在加载演示物流数据…</s-text>}
    {error && <s-banner tone="critical">加载失败：{error}</s-banner>}
    {shipment && <s-stack direction="block">
      <s-badge tone={shipment.status === 'exception' ? 'critical' : 'success'}>{statusLabel[shipment.status]}</s-badge>
      <s-text>承运商：{shipment.carrier}</s-text>
      <s-text>运单号：{shipment.trackingNumber}</s-text>
      <s-text>{shipment.eta}</s-text>
    </s-stack>}
    {orderId && <s-button onClick={() => void load()} disabled={loading}>重新加载</s-button>}
  </s-admin-block>;
}
