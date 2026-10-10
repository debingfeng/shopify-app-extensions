type BackendApiBaseValidationOptions = {
  nodeEnv?: string;
  source: string;
};

function isDevProxyBase(value: string) {
  const trimmedValue = value.trim();
  return trimmedValue === "/dev-proxy" || trimmedValue.startsWith("/dev-proxy/");
}

export function validateBackendApiBase(
  value: string,
  { nodeEnv = process.env.NODE_ENV, source }: BackendApiBaseValidationOptions,
) {
  if (nodeEnv === "development") return;

  if (isDevProxyBase(value)) {
    throw new Error(
      `${source} must not use /dev-proxy outside local development.`,
    );
  }
}
