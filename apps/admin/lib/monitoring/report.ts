import { env } from "@/lib/env";

type ClientErrorPayload = {
  code: string;
  message: string;
  status?: number;
  url?: string;
  context?: Record<string, unknown>;
};

export async function reportClientError(payload: ClientErrorPayload) {
  try {
    await fetch(`${env.BACKEND_API_BASE}/v1/client-errors`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // Intentionally swallow client error reporting failures.
  }
}
