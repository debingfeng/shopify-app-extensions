import type { LogisticsStatus } from './logistics';

export const statusLabel: Record<LogisticsStatus, string> = {
  in_transit: '运输中',
  delivered: '已送达',
  exception: '异常',
};

export function shortId(id: string): string {
  return id.length > 18 ? `…${id.slice(-18)}` : id;
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '未知错误';
}
