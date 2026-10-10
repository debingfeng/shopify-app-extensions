export type LogisticsStatus = 'in_transit' | 'delivered' | 'exception';

export interface ShipmentSummary {
  orderId: string;
  carrier: string;
  trackingNumber: string;
  status: LogisticsStatus;
  eta: string;
}

export interface BatchSyncResult {
  succeeded: string[];
  failed: { orderId: string; reason: string }[];
}

const delay = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function hashId(id: string): number {
  return [...id].reduce((value, char) => (value * 31 + char.charCodeAt(0)) % 997, 0);
}

/**
 * Deterministic teaching mock. Replace this adapter with fetch('/api/logistics/...')
 * when the app backend can validate Shopify's automatically attached ID Token.
 */
export async function getShipment(orderId: string): Promise<ShipmentSummary> {
  if (!orderId) throw new Error('缺少订单 ID');
  await delay(250);
  const hash = hashId(orderId);
  const statuses: LogisticsStatus[] = ['in_transit', 'delivered', 'exception'];
  return {
    orderId,
    carrier: 'Demo Express',
    trackingNumber: `DEMO${String(hash).padStart(6, '0')}`,
    status: statuses[hash % statuses.length],
    eta: '演示数据（无真实预计送达时间）',
  };
}

export async function syncShipments(orderIds: string[]): Promise<BatchSyncResult> {
  if (orderIds.length === 0) throw new Error('请先选择订单');
  await delay(400);
  const uniqueIds = [...new Set(orderIds)];
  return uniqueIds.reduce<BatchSyncResult>((result, orderId) => {
    if (hashId(orderId) % 5 === 0) {
      result.failed.push({ orderId, reason: '演示用模拟失败' });
    } else {
      result.succeeded.push(orderId);
    }
    return result;
  }, { succeeded: [], failed: [] });
}
