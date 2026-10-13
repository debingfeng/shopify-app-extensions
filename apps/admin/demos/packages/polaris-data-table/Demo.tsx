"use client";

import { useMemo, useState } from "react";
import { Badge, Card, BlockStack, Text } from "@shopify/polaris";
import {
  Table,
  type TableColumn,
  type TableFilterDefinition,
  type TableQuery,
  type TableSelection,
} from "@standhigher/polaris-data-table";
import { useRouter } from "next/router";

import { resolveLocaleValue } from "@/lib/i18n/pages";

type Product = {
  id: string;
  title: string;
  status: "active" | "draft";
  price: number;
  currencyCode: string;
};

const PRODUCTS: Product[] = [
  { id: "p-01", title: "Everyday Tote", status: "active", price: 28, currencyCode: "USD" },
  { id: "p-02", title: "Canvas Backpack", status: "active", price: 64, currencyCode: "USD" },
  { id: "p-03", title: "Travel Pouch", status: "draft", price: 18, currencyCode: "USD" },
  { id: "p-04", title: "Ceramic Mug", status: "active", price: 22, currencyCode: "USD" },
  { id: "p-05", title: "Linen Notebook", status: "draft", price: 16, currencyCode: "USD" },
  { id: "p-06", title: "Desk Calendar", status: "active", price: 24, currencyCode: "USD" },
  { id: "p-07", title: "Weekend Duffel", status: "active", price: 88, currencyCode: "USD" },
  { id: "p-08", title: "Cotton Cap", status: "draft", price: 26, currencyCode: "USD" },
  { id: "p-09", title: "Reusable Bottle", status: "active", price: 32, currencyCode: "USD" },
  { id: "p-10", title: "Phone Stand", status: "active", price: 19, currencyCode: "USD" },
  { id: "p-11", title: "Wool Scarf", status: "draft", price: 48, currencyCode: "USD" },
  { id: "p-12", title: "Studio Lamp", status: "active", price: 120, currencyCode: "USD" },
];

const COPY = {
  en: {
    heading: "Mock product list",
    note: "Search, filter, sort, select rows, and change pages. No Shopify data is modified.",
    product: "Product",
    status: "Status",
    price: "Price",
    active: "Active",
    draft: "Draft",
    all: "All statuses",
    selected: "Selected rows: {count}",
    empty: "No products match this query.",
    pagination: "Product pages",
    previousPage: "Previous page",
    nextPage: "Next page",
    itemsPerPage: "Items per page",
  },
  "zh-CN": {
    heading: "模拟商品列表",
    note: "可搜索、筛选、排序、选择行和翻页；不会修改 Shopify 数据。",
    product: "商品",
    status: "状态",
    price: "价格",
    active: "已上架",
    draft: "草稿",
    all: "全部状态",
    selected: "已选行数：{count}",
    empty: "没有匹配的商品。",
    pagination: "商品分页",
    previousPage: "上一页",
    nextPage: "下一页",
    itemsPerPage: "每页数量",
  },
} as const;

export default function PolarisDataTableDemo() {
  const router = useRouter();
  const locale = resolveLocaleValue(router.query.locale);
  const copy = COPY[locale];
  const [query, setQuery] = useState<TableQuery>({ page: 1, pageSize: 10 });
  const [selection, setSelection] = useState<TableSelection>({ mode: "explicit", ids: [] });

  const columns = useMemo<TableColumn<Product>[]>(() => [
    { key: "title", title: copy.product, sortable: true },
    {
      key: "status",
      title: copy.status,
      type: "status",
      render: (_value, product) => (
        <Badge tone={product.status === "active" ? "success" : "info"}>
          {product.status === "active" ? copy.active : copy.draft}
        </Badge>
      ),
    },
    { key: "price", title: copy.price, type: "money", sortable: true, currencyCode: "USD" },
  ], [copy]);
  const filters = useMemo<TableFilterDefinition[]>(() => [{
    key: "status",
    label: copy.status,
    type: "select",
    operators: ["equals"],
    options: [
      { label: copy.all, value: "" },
      { label: copy.active, value: "active" },
      { label: copy.draft, value: "draft" },
    ],
  }], [copy]);

  const page = useMemo(() => {
    const search = query.search?.trim().toLocaleLowerCase() ?? "";
    const statusFilter = query.filters?.status;
    const status = statusFilter?.operator === "equals" ? statusFilter.value : undefined;
    const matching = PRODUCTS.filter((product) =>
      (!search || product.title.toLocaleLowerCase().includes(search)) &&
      (!status || product.status === status),
    );
    if (query.sort?.field === "title" || query.sort?.field === "price") {
      const field = query.sort.field;
      const direction = query.sort.direction === "asc" ? 1 : -1;
      matching.sort((a, b) => {
        const difference = field === "price"
          ? a.price - b.price
          : a.title.localeCompare(b.title);
        return difference * direction;
      });
    }
    const start = (query.page - 1) * query.pageSize;
    return { data: matching.slice(start, start + query.pageSize), total: matching.length };
  }, [query]);

  const selectedCount = selection.mode === "explicit" ? selection.ids.length : selection.selectedCount;

  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h2" variant="headingMd">{copy.heading}</Text>
        <Text as="p" variant="bodyMd">{copy.note}</Text>
        <Text as="p" variant="bodySm">{copy.selected.replace("{count}", String(selectedCount))}</Text>
        <Table
          columns={columns}
          data={page.data}
          rowId="id"
          query={query}
          pagination={{ total: page.total }}
          formatOptions={{ locale: locale === "zh-CN" ? "zh-CN" : "en-US", timeZone: "Asia/Shanghai", defaultCurrencyCode: "USD" }}
          filters={filters}
          selection={selection}
          onSelectionChange={setSelection}
          onQueryChange={setQuery}
          labels={{
            empty: copy.empty,
            pagination: copy.pagination,
            previousPage: copy.previousPage,
            nextPage: copy.nextPage,
            itemsPerPage: copy.itemsPerPage,
          }}
        />
      </BlockStack>
    </Card>
  );
}
