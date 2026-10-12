import { render } from 'preact';
import { useState } from 'preact/hooks';
import { getSelectedIds } from './shared/context';
import { syncShipments, type BatchSyncResult } from './shared/logistics';
import { errorMessage, shortId } from './shared/ui';

export default async () => {
  render(<OrderIndexSelectionAction />, document.body);
};

function OrderIndexSelectionAction() {
  const orderIds = getSelectedIds();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<BatchSyncResult>();

  async function submit() {
    if (orderIds.length === 0 || loading) return;
    setLoading(true);
    setError('');
    setResult(undefined);
    try {
      setResult(await syncShipments(orderIds));
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setLoading(false);
    }
  }

  return <s-admin-action heading="批量同步物流（教学 Demo）">
    <s-button slot="primary-action" disabled={orderIds.length === 0 || loading} onClick={() => void submit()}>
      {loading ? '正在同步…' : `同步 ${orderIds.length} 个订单`}
    </s-button>
    <s-button slot="secondary-actions" onClick={() => shopify.close()}>关闭</s-button>
    <s-text>当前选中 {orderIds.length} 个订单。演示数据不会触发真实同步。</s-text>
    {orderIds.length === 0 && <s-banner tone="warning">请先选择订单。</s-banner>}
    {error && <s-banner tone="critical">同步失败：{error}</s-banner>}
    {result && <s-stack direction="block">
      <s-text>成功 {result.succeeded.length} 个，失败 {result.failed.length} 个。</s-text>
      {result.failed.map(({ orderId, reason }) => <s-text key={orderId}>失败：{shortId(orderId)}（{reason}）</s-text>)}
    </s-stack>}
  </s-admin-action>;
}
