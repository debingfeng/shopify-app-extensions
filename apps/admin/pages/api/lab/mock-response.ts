import { randomUUID } from "node:crypto";
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(request: NextApiRequest, response: NextApiResponse) {
  response.setHeader("Cache-Control", "no-store");
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const mode = request.query.mode;
  const requestId = randomUUID();
  if (mode === "validation") {
    return response.status(422).json({ requestId, error: "Example validation error" });
  }
  if (mode === "server") {
    return response.status(503).json({ requestId, error: "Example service error" });
  }
  if (mode !== "success") {
    return response.status(400).json({ requestId, error: "Unknown response mode" });
  }
  return response.status(200).json({ requestId, message: "Example request succeeded" });
}
