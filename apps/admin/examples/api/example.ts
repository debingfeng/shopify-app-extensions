"use client";

/**
 * 示例 API：TokenProvider 模式
 *
 * 该文件位于 `examples/`，不会被应用自动引用。
 * 真实业务 API 请按领域拆分到 `lib/api/` 下，例如 `settings.ts`、`orders.ts`。
 *
 * 核心约定：
 * 1. 每个 API 函数接收 `getToken`（`TokenProvider`）并在函数内部取 token
 * 2. 请求头中携带 `Authorization: Bearer <token>`
 * 3. 同时检查 HTTP 状态码和业务 `code` 字段，不符合时抛错
 */

import type { TokenProvider } from "@/lib/api/useTokenProvider";
import { env } from "@/lib/env";

type BaseApiResponse<T> = {
  code: number;
  msg: string;
  data: T;
};

type ExampleItem = {
  id: string;
  name: string;
};

type ExampleListData = {
  list: ExampleItem[];
  total: number;
};

export async function fetchExampleList(
  getToken: TokenProvider,
): Promise<ExampleListData> {
  const token = await getToken();
  const url = `${env.BACKEND_API_BASE}/api/v1/app/example/list`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`fetchExampleList failed: ${response.status}`);
  }

  const json = (await response.json()) as BaseApiResponse<ExampleListData>;
  if (json.code !== 0) {
    throw new Error(json.msg || "fetchExampleList failed");
  }

  return json.data;
}

type CreateExampleParams = {
  name: string;
};

export async function createExample(
  params: CreateExampleParams,
  getToken: TokenProvider,
): Promise<ExampleItem> {
  const token = await getToken();
  const url = `${env.BACKEND_API_BASE}/api/v1/app/example/create`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`createExample failed: ${response.status}`);
  }

  const json = (await response.json()) as BaseApiResponse<ExampleItem>;
  if (json.code !== 0) {
    throw new Error(json.msg || "createExample failed");
  }

  return json.data;
}

/*
 * ---------- 示例用法 ----------
 *
 * import { useEffect } from "react";
 * import { useTokenProvider } from "@/lib/api/useTokenProvider";
 * import { createExample, fetchExampleList } from "@/examples/api/example";
 *
 * export default function MyPage() {
 *   const getToken = useTokenProvider();
 *
 *   useEffect(() => {
 *     fetchExampleList(getToken).then(setItems).catch(console.error);
 *   }, [getToken]);
 *
 *   const handleCreate = async () => {
 *     await createExample({ name: "new" }, getToken);
 *   };
 * }
 */
