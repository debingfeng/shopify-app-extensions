export function logInfo(event: string, payload: object) {
  console.info(`[local-proxy][${event}]`, payload);
}

export function logError(event: string, payload: object) {
  console.error(`[local-proxy][${event}]`, payload);
}
