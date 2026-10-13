import type { NextApiRequest, NextApiResponse } from "next";
import { createRichTextDocument } from "@standhigher/shopify-rich-text-core";
import { processRichText } from "@standhigher/shopify-rich-text-server";

export const config = {
  api: { bodyParser: { sizeLimit: "32kb" } },
};

export default function handler(request: NextApiRequest, response: NextApiResponse) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  try {
    const document = createRichTextDocument(request.body?.content);
    const result = processRichText(document, { channel: "shopify-html" });
    if (!result.ok) {
      return response.status(400).json({ error: result.error.message });
    }
    return response.status(200).json({ html: result.html, warnings: result.warnings });
  } catch {
    return response.status(400).json({ error: "Invalid rich text document" });
  }
}
