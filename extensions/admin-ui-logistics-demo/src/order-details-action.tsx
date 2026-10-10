import { render } from 'preact';
import { useState } from 'preact/hooks';
import { getFirstSelectedId } from './shared/context';
import { syncShipments } from './shared/logistics';
import { errorMessage, shortId } from './shared/ui';

export default async () => {
  render(<OrderDetailsAction />, document.body);
};

function OrderDetailsAction() {
  const orderId = getFirstSelectedId();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    if (!orderId || loading) return;
    setLoading(true);
    setError('');
    try {
      const result = await syncShipments([orderId]);
      if (result.failed.length) {
        setError(result.failed[0].reason);
      } else {
        shopify.close();
      }
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setLoading(false);
    }
  }

  return <s-admin-action heading="刷新物流（教学 Demo）">
    <s-button slot="primary-action" disabled={!orderId || loading} onClick={() => void submit()}>
      {loading ? '正在刷新…' : '确认刷新'}
    </s-button>
    <s-button slot="secondary-actions" onClick={() => shopify.close()}>取消</s-button>
    <s-text>{orderId ? `订单：${shortId(orderId)}` : '当前页面没有提供订单 ID。'}</s-text>
    <s-text>当前操作使用确定性 mock，不会修改真实物流信息。</s-text>
    {error && <s-banner tone="critical">刷新失败：{error}</s-banner>}
  </s-admin-action>;
}
